use std::sync::Arc;

use axum::{Json, extract::State, http::StatusCode};
use mysql_async::{Pool, prelude::Queryable};
use validator::Validate;

use crate::{
    errors::category_error::CategoryError,
    middleware::auth_middleware::{AuthUser, admin_check},
    schemas::category::CategoryPayload,
    utils::db::get_db_connection,
};

// function untuk create atau insert ke database
#[axum::debug_handler]
pub async fn categories_store(
    State(pool): State<Arc<Pool>>,
    auth_user: AuthUser,
    Json(payload): Json<CategoryPayload>,
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
    // check category sudah ada atau belum
    let existing_category: Option<(u64,)> = conn
        .exec_first(
            "SELECT id FROM category WHERE title = ?",
            (payload.title.clone(),),
        )
        .await
        .map_err(|_| {
            let error = CategoryError::DatabaseError("Gagal memeriksa kategori");
            (error.status_code(), Json(error.to_json()))
        })?;

    if existing_category.is_some() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({
                "message": "Kategori sudah ada",
                "status": "invalid"
            })),
        ));
    }

    // insert data ke database
    let results = conn
        .exec_drop("INSERT INTO category (title) VALUES (?)", (&payload.title,))
        .await;

    match results {
        Ok(_) => Ok((
            StatusCode::CREATED,
            Json(serde_json::json!({
                "message": "Berhasil membuat category",
                "status": "success",
                "data": {
                    "id": conn.last_insert_id(),
                    "title": &payload.title,
                }
            })),
        )),
        Err(e) => {
            eprintln!("Gagal membuat category: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({
                    "error": "Gagal membuat category",
                    "status": "error"
                })),
            ))
        }
    }
}
