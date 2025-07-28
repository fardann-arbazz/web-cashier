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
    utils::db::get_db_connection,
};

// function untuk delete data by id
#[axum::debug_handler]
pub async fn delete_user_by_id(
    State(pool): State<Arc<Pool>>,
    auth_user: AuthUser,
    Path(user_id): Path<u64>,
) -> Result<(StatusCode, Json<serde_json::Value>), (StatusCode, Json<serde_json::Value>)> {
    // check apakah users admin atau bukan
    admin_check(&auth_user)?;

    // dapatkan koneksi database
    let mut conn = get_db_connection(&pool).await?;

    // check users ada di database
    let results = conn
        .exec_first::<(u64,), _, _>("SELECT id FROM users WHERE id = ?", (user_id,))
        .await
        .map_err(|_| {
            let error = UserError::DatabaseError("Gagal Mengambil Data Pengguna");
            (error.status_code(), Json(error.to_json()))
        })?;

    match results {
        Some(id) => {
            // Delete user by id
            conn.exec_drop("DELETE FROM users WHERE id = ?", id)
                .await
                .map_err(|_| {
                    let error = UserError::DatabaseError("Gagal Menghapus Data Pengguna");
                    (error.status_code(), Json(error.to_json()))
                })?;

            let json_response = serde_json::json!({
                "message": "User deleted successfully",
                "status": "success",
            });

            Ok((StatusCode::OK, Json(json_response)))
        }
        None => {
            let error_response = serde_json::json!({
                "error": "User not found",
                "status": "invalid"
            });
            Err((StatusCode::NOT_FOUND, Json(error_response)))
        }
    }
}
