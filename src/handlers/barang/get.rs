use std::sync::Arc;

use axum::{
    Json,
    extract::{Path, Query, State},
    http::StatusCode,
};
use mysql_async::{Pool, params, prelude::Queryable};

use crate::{
    middleware::auth_middleware::{AuthUser, admin_check},
    schemas::{
        barang::BarangResponse,
        pagination::{Pagination, PaginationMeta},
    },
    utils::{
        calculate_pagination::calculate_pagination,
        db::get_db_connection,
        response::{error, success, success_with_pagination},
    },
};

// get all barang from database
pub async fn get_all_barang(
    State(pool): State<Arc<Pool>>,
    Query(paination): Query<Pagination>,
) -> Result<(StatusCode, Json<serde_json::Value>), (StatusCode, Json<serde_json::Value>)> {
    // ambil value pagination
    let (page, limit, offset) = calculate_pagination(paination.page, paination.limit);

    // dapatkan koneksi ke database
    let mut conn = get_db_connection(&pool).await?;

    // search values
    let search_term = paination.search.unwrap_or_default();
    let search_like = format!("%{}%", search_term);

    // query untuk menghitung total
    let total_query = if search_term.is_empty() {
        "SELECT COUNT(*) FROM barang"
    } else {
        "SELECT COUNT(*) FROM barang WHERE nama LIKE ?"
    };

    let total: u64 = if search_term.is_empty() {
        conn.query_first(total_query)
            .await
            .unwrap_or(Some(0))
            .unwrap_or(0)
    } else {
        conn.exec_first(total_query, (&search_like,))
            .await
            .unwrap_or(Some(0))
            .unwrap_or(0)
    };

    // query data barang + join category
    let query_barang = if search_term.is_empty() {
        r#"
        SELECT b.id, b.nama, b.harga, b.stok, b.category_id, c.title as category_title
        FROM barang b
        LEFT JOIN category c ON b.category_id = c.id
        LIMIT ? OFFSET ?
        "#
    } else {
        r#"
        SELECT b.id, b.nama, b.harga, b.stok, b.category_id, c.title as category_title
        FROM barang b
        LEFT JOIN category c ON b.category_id = c.id
        WHERE b.nama LIKE ?
        LIMIT ? OFFSET ?
        "#
    };

    let barang: Vec<BarangResponse> = if search_term.is_empty() {
        conn.exec_map(
            query_barang,
            (limit, offset),
            |(id, nama, harga, stok, category_id, category_title)| BarangResponse {
                id,
                nama,
                harga,
                stok,
                category_id,
                category_title,
            },
        )
        .await
        .map_err(|_| {
            error(
                "Gagal mengambil data barang",
                StatusCode::INTERNAL_SERVER_ERROR,
            )
        })?
    } else {
        conn.exec_map(
            query_barang,
            (&search_like, limit, offset),
            |(id, nama, harga, stok, category_id, category_title)| BarangResponse {
                id,
                nama,
                harga,
                stok,
                category_id,
                category_title,
            },
        )
        .await
        .map_err(|_| {
            error(
                "Gagal mengambil data barang",
                StatusCode::INTERNAL_SERVER_ERROR,
            )
        })?
    };

    Ok((
        StatusCode::OK,
        success_with_pagination(
            "Barang berhasil ditampilkan",
            barang,
            PaginationMeta {
                current_page: page,
                limit,
                total,
                total_pages: (total as f64 / limit as f64).ceil() as u64,
            },
        ),
    ))
}

// function untuk get barang by id
#[axum::debug_handler]
pub async fn get_barang_by_id(
    State(pool): State<Arc<Pool>>,
    auth_user: AuthUser,
    Path(barang_id): Path<u64>,
) -> Result<(StatusCode, Json<serde_json::Value>), (StatusCode, Json<serde_json::Value>)> {
    // check apakah users admin atau bukan
    admin_check(&auth_user)?;

    // dapatkan koneksi database
    let mut conn = get_db_connection(&pool).await?;

    // query untuk mendapatkan barang
    let query = r#"
       SELECT 
            b.id as id, 
            b.nama as nama, 
            b.harga as harga, 
            b.stok as stok, 
            b.category_id as category_id, 
            c.title as category_title
        FROM barang b
        LEFT JOIN category c ON b.category_id = c.id
        WHERE b.id = :id
    "#;

    let results = conn
    .exec_first::<(u64, String, u64, u32, u64, String), _, _>( // ← gunakan tuple
        query,
        params! {
            "id" => barang_id
        },
    )
    .await
    .map_err(|_| error("Database error", StatusCode::INTERNAL_SERVER_ERROR))?;

    match results {
        Some((id, nama, harga, stok, category_id, category_title)) => {
            let barang_response = BarangResponse {
                id,
                nama,
                harga,
                stok,
                category_id,
                category_title,
            };

            let json_response = serde_json::json!(barang_response);

            Ok((
                StatusCode::OK,
                success("Barang by id berhasil di dapatkan", json_response),
            ))
        }
        None => Err(error("Barang tidak ditemukan", StatusCode::NOT_FOUND)),
    }
}
