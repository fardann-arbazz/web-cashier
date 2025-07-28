use std::sync::Arc;

use axum::{Json, extract::State, http::StatusCode};
use mysql_async::{Pool, prelude::Queryable};
use validator::Validate;

use crate::{
    errors::{category_error::CategoryError, user_error::UserError},
    middleware::auth_middleware::{AuthUser, admin_check},
    models::user::Role,
    schemas::user::UserPayload,
    utils::{argon2::hash_password, db::get_db_connection},
};

// Function handler untu membuat users
#[axum::debug_handler]
pub async fn users_store(
    State(pool): State<Arc<Pool>>,
    auth_user: AuthUser,
    Json(payload): Json<UserPayload>,
) -> Result<(StatusCode, Json<serde_json::Value>), (StatusCode, Json<serde_json::Value>)> {
    // check apakah users admin atau bukan
    admin_check(&auth_user)?;

    // validasi input error
    if let Err(validation_errors) = payload.validate() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({
                "error": validation_errors,
                "status": "invalid"
            })),
        ));
    }

    // dapatkan koneksi database
    let mut conn = get_db_connection(&pool).await?;

    // check username sudah ada atau belum
    let existing_user: Option<(u64,)> = conn
        .exec_first(
            "SELECT id FROM users WHERE username = ?",
            (payload.username.clone(),),
        )
        .await
        .map_err(|_| {
            let error = CategoryError::DatabaseError("Gagal memeriksa username");
            (error.status_code(), Json(error.to_json()))
        })?;

    if existing_user.is_some() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({
                "message": "Username sudah digunakan",
                "status": "invalid"
            })),
        ));
    }

    // hash password input
    let hashed_password = hash_password(&payload.password).map_err(|_| {
        let error = UserError::DatabaseError("Gagal meng-hash password");
        (error.status_code(), Json(error.to_json()))
    })?;

    // insert data ke database
    let role_str = match payload.role {
        Role::Admin => "Admin",
        Role::Kasir => "Kasir",
    };

    let results = conn
        .exec_drop(
            "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
            (&payload.username, &hashed_password, &role_str),
        )
        .await;

    match results {
        Ok(_) => Ok((
            StatusCode::CREATED,
            Json(serde_json::json!({
                "message": "Berhasil membuat user",
                "status": "success",
                "data": {
                    "id": conn.last_insert_id(),
                    "username": &payload.username,
                    "role": &role_str,
                }
            })),
        )),
        Err(e) => {
            eprintln!("Gagal membuat user: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({
                    "error": "Gagal membuat user",
                    "status": "error"
                })),
            ))
        }
    }
}
