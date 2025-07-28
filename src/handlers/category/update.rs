use std::sync::Arc;

use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use mysql_async::{Pool, prelude::Queryable};

use crate::{
    middleware::auth_middleware::{AuthUser, admin_check},
    schemas::category::CategoryPayload,
    utils::db::get_db_connection,
};

// function update data category by id
#[axum::debug_handler]
pub async fn update_category_by_id(
    State(pool): State<Arc<Pool>>,
    auth_user: AuthUser,
    Path(category_id): Path<u64>,
    Json(payload): Json<CategoryPayload>,
) -> Result<(StatusCode, Json<serde_json::Value>), (StatusCode, Json<serde_json::Value>)> {
    // check apakah users admin atau bukan
    admin_check(&auth_user)?;

    // dapatkan koneksi database
    let mut conn = get_db_connection(&pool).await?;

    // cek apakah kategori ada di database
    let existing_category = conn
        .exec_first::<(u64, String), _, _>(
            "SELECT id, title FROM category WHERE id = ?",
            (category_id,),
        )
        .await;

    match existing_category {
        Ok(Some((id, _))) => {
            // update category data
            let update_query = r"
            UPDATE category SET title = ? WHERE id = ?
            ";

            let params = (&payload.title, id);

            let update_results = conn.exec_drop(update_query, params).await;

            match update_results {
                Ok(_) => {
                    let response = serde_json::json!({
                        "message": "Category updated successfully",
                        "status": "success",
                        "data": {
                            "id": id,
                            "title": payload.title
                        }
                    });

                    Ok((StatusCode::OK, Json(response)))
                }
                Err(_) => {
                    let error_response = serde_json::json!({
                        "error": "Failed to update category",
                        "status": "error"
                    });

                    Err((StatusCode::INTERNAL_SERVER_ERROR, Json(error_response)))
                }
            }
        }
        Ok(None) => {
            let error_response = serde_json::json!({
                "error": "Category not found",
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
