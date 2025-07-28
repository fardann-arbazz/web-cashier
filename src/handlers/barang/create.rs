use std::sync::Arc;

use axum::{Json, extract::State, http::StatusCode};
use mysql_async::{Pool, prelude::Queryable};
use serde_json::json;
use validator::Validate;

use crate::{
    middleware::auth_middleware::{AuthUser, admin_check},
    schemas::barang::BarangPayload,
    utils::{
        db::get_db_connection,
        response::{error, success},
    },
};

// function untuk create atau insert ke database
#[axum::debug_handler]
pub async fn barang_store(
    State(pool): State<Arc<Pool>>,
    auth_user: AuthUser,
    Json(payload): Json<BarangPayload>,
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

    // query untuk mengecek apakah barang sudah ada atau belum
    let existing_barang: Option<(u64,)> = conn
        .exec_first(
            "SELECT id FROM barang WHERE nama = ?",
            (payload.nama.clone(),),
        )
        .await
        .map_err(|_| error("Barang tidak ditemukan", StatusCode::NOT_FOUND))?;

    if existing_barang.is_some() {
        return Err(error("Barang sudah ada", StatusCode::BAD_REQUEST));
    }

    // query untuk memasukkan data ke database
    let results = conn
        .exec_drop(
            "INSERT INTO barang (nama, harga, stok, category_id) VALUE (?, ?, ?, ?)",
            (
                &payload.nama,
                &payload.harga,
                &payload.stok,
                &payload.category_id,
            ),
        )
        .await;

    let response_json = json!({
        "id": conn.last_insert_id(),
        "nama": &payload.nama,
        "harga": &payload.harga,
        "stok": &payload.stok,
        "category_id": &payload.category_id
    });

    match results {
        Ok(_) => Ok((
            StatusCode::CREATED,
            success("Created barang successfully!", response_json),
        )),
        Err(e) => {
            eprintln!("Gagal membuat barang: {}", e);
            Err(error(
                "Gagal membuat barang",
                StatusCode::INTERNAL_SERVER_ERROR,
            ))
        }
    }
}
