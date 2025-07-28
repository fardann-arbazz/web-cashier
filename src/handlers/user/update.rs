use std::sync::Arc;

use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use mysql_async::{Pool, prelude::Queryable};

use crate::{
    errors::user_error::UserError,
    middleware::auth_middleware::{AuthUser, admin_check},
    models::user::Role,
    schemas::user::UserUpdatePayload,
    utils::{argon2::hash_password, db::get_db_connection},
};

// function untuk update data by id
#[axum::debug_handler]
pub async fn update_user_by_id(
    State(pool): State<Arc<Pool>>,
    auth_user: AuthUser,
    Path(user_id): Path<u64>,
    Json(payload): Json<UserUpdatePayload>,
) -> Result<(StatusCode, Json<serde_json::Value>), (StatusCode, Json<serde_json::Value>)> {
    // check apakah users admin atau bukan
    admin_check(&auth_user)?;

    // dapatkan koneksi database
    let mut conn = get_db_connection(&pool).await?;

    // cek users ada di database
    let results = conn
        .exec_first::<(u64, String, String, String), _, _>(
            "SELECT id, username, password, role FROM users WHERE id = ?",
            (user_id,),
        )
        .await;

    match results {
        Ok(Some((id, _, password, _))) => {
            // hash password input
            let hashed_password = match payload.password {
                Some(password) => hash_password(&password).map_err(|_| {
                    let error = UserError::DatabaseError("Gagal meng-hash password");
                    (error.status_code(), Json(error.to_json()))
                })?,
                None => password,
            };

            // cek role
            let role_str = match payload.role {
                Role::Admin => "Admin",
                Role::Kasir => "Kasir",
            };

            // Update data user dengan prepared statement
            let update_query = r"
            UPDATE users 
            SET 
                username = ?,
                password = ?,
                role = ?
            WHERE id = ?
        ";

            let params = (&payload.username, &hashed_password, &role_str, id);

            let update_result = conn.exec_drop(update_query, params).await;

            match update_result {
                Ok(_) => {
                    let json_response = serde_json::json!({
                        "message": "User updated successfully",
                        "status": "success",
                        "data": {
                            "id": id,
                            "username": payload.username,
                            "role": role_str,
                        }
                    });

                    Ok((StatusCode::OK, Json(json_response)))
                }
                Err(_) => {
                    let error_response = serde_json::json!({
                        "error": "Failed to update user",
                        "status": "error"
                    });
                    Err((StatusCode::INTERNAL_SERVER_ERROR, Json(error_response)))
                }
            }
        }
        Ok(None) => {
            let error_response = serde_json::json!({
                "error": "User not found",
                "status": "invalid"
            });
            Err((StatusCode::NOT_FOUND, Json(error_response)))
        }
        Err(_) => {
            let error_response = serde_json::json!({
                "error": "Failed to connect to the database",
                "status": "error"
            });
            Err((StatusCode::INTERNAL_SERVER_ERROR, Json(error_response)))
        }
    }
}
