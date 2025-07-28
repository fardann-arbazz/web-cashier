use std::sync::Arc;

use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use mysql_async::{Pool, params, prelude::Queryable};
use serde_json::json;

use crate::{
    middleware::auth_middleware::{AuthUser, admin_check},
    schemas::barang::{BarangPayload, BarangResponse},
    utils::{
        db::get_db_connection,
        response::{error, success},
    },
};

// function untuk update barang by id
#[axum::debug_handler]
pub async fn update_barang_by_id(
    State(pool): State<Arc<Pool>>,
    auth_user: AuthUser,
    Path(barang_id): Path<u64>,
    Json(payload): Json<BarangPayload>,
) -> Result<(StatusCode, Json<serde_json::Value>), (StatusCode, Json<serde_json::Value>)> {
    // check user admin bukan
    admin_check(&auth_user)?;

    // dapatkan koneksi database
    let mut conn = get_db_connection(&pool).await?;

    // query check barang ada di db tidak
    let barang = conn
        .exec_first::<BarangResponse, _, _>(
            r#"SELECT b.id, b.nama, b.harga, b.stok, b.category_id, c.title as category_title
               FROM barang b
               LEFT JOIN category c ON b.category_id = c.id
               WHERE b.id = :id"#,
            params! { "id" => barang_id },
        )
        .await
        .map_err(|_| error("Database error", StatusCode::INTERNAL_SERVER_ERROR))?;

    if barang.is_none() {
        return Err(error("Barang not found", StatusCode::NOT_FOUND));
    }

    // query update barang
    conn.exec_drop(
        r#"UPDATE barang SET nama = :nama, harga = :harga, stok = :stok, category_id = :category_id WHERE id = :id"#,
        params! {
            "nama" => &payload.nama,
            "harga" => &payload.harga,
            "stok" => &payload.stok,
            "category_id" => &payload.category_id,
            "id" => barang_id,
        },
    )
    .await
    .map_err(|_| error("Failed to update barang", StatusCode::INTERNAL_SERVER_ERROR))?;

    // response json data
    let response_data = json!({
        "id": barang_id,
        "nama": payload.nama,
        "harga": payload.harga,
        "stok": payload.stok,
        "category_id": payload.category_id,
    });

    Ok((
        StatusCode::OK,
        success("Barang updated successfully", response_data),
    ))
}
