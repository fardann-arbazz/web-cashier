use std::sync::Arc;

use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use mysql_async::{Pool, prelude::Queryable};

use crate::{
    middleware::auth_middleware::{AuthUser, admin_check},
    utils::{db::get_db_connection, response::error},
};

// function untuk delete barang by id
#[axum::debug_handler]
pub async fn delete_barang_by_id(
    State(pool): State<Arc<Pool>>,
    auth_user: AuthUser,
    Path(barang_id): Path<u64>,
) -> Result<(StatusCode, Json<serde_json::Value>), (StatusCode, Json<serde_json::Value>)> {
    // check apakah users admin atau bukan
    admin_check(&auth_user)?;

    // dapatkan koneksi database
    let mut conn = get_db_connection(&pool).await?;

    // check apakah barang ada di database
    let results = conn
        .exec_first::<(u64,), _, _>("SELECT id FROM barang WHERE id = ?", (barang_id,))
        .await
        .map_err(|_| error("Barang not found", StatusCode::NOT_FOUND))?;

    match results {
        Some(id) => {
            conn.exec_drop("DELETE FROM barang WHERE id = ?", id)
                .await
                .map_err(|_| error("Gagal menghapus barang", StatusCode::INTERNAL_SERVER_ERROR))?;

            let json_response = serde_json::json!({
                "message": "Barang deleted successfully",
                "status": "success"
            });

            Ok((StatusCode::OK, Json(json_response)))
        }
        None => Err(error("Barang not found", StatusCode::NOT_FOUND)),
    }
}
