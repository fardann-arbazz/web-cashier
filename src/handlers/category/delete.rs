use std::sync::Arc;

use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use mysql_async::{Pool, prelude::Queryable};

use crate::{
    errors::category_error::CategoryError,
    middleware::auth_middleware::{AuthUser, admin_check},
    utils::db::get_db_connection,
};

// function untuk delete data by id
#[axum::debug_handler]
pub async fn delete_category_by_id(
    State(pool): State<Arc<Pool>>,
    auth_user: AuthUser,
    Path(category_id): Path<u64>,
) -> Result<(StatusCode, Json<serde_json::Value>), (StatusCode, Json<serde_json::Value>)> {
    // check apakah users admin atau bukan
    admin_check(&auth_user)?;

    // dapatkan koneksi database
    let mut conn = get_db_connection(&pool).await?;

    // check apakah kategori ada di database
    let results = conn
        .exec_first::<(u64,), _, _>("SELECT id FROM category WHERE id = ?", (category_id,))
        .await
        .map_err(|_| {
            let error = CategoryError::NotFound("Category not found");
            (error.status_code(), Json(error.to_json()))
        })?;

    match results {
        Some(id) => {
            conn.exec_drop("DELETE FROM category WHERE id = ?", id)
                .await
                .map_err(|_| {
                    let error = CategoryError::DatabaseError("Gagal Menghapus Data Kategori");
                    (error.status_code(), Json(error.to_json()))
                })?;

            let json_response = serde_json::json!({
                "message": "Category deleted successfully",
                "status": "success"
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
