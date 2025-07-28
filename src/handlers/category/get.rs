use std::sync::Arc;

use axum::{
    Json,
    extract::{Path, Query, State},
    http::StatusCode,
};
use mysql_async::{Pool, prelude::Queryable};

use crate::{
    errors::user_error::UserError,
    middleware::auth_middleware::{AuthUser, admin_check},
    schemas::{
        category::CategoryResponse,
        pagination::{Pagination, PaginationMeta},
    },
    utils::{
        calculate_pagination::calculate_pagination,
        db::get_db_connection,
        response::{error, success, success_with_pagination},
    },
};

// get all category with pagination and search
pub async fn get_all_category(
    State(pool): State<Arc<Pool>>,
    Query(paginaton): Query<Pagination>,
    auth_user: AuthUser,
) -> Result<(StatusCode, Json<serde_json::Value>), (StatusCode, Json<serde_json::Value>)> {
    // Check apakah users admin atau bukan
    admin_check(&auth_user)?;

    // Ambil pagination values
    let (page, limit, offset) = calculate_pagination(paginaton.page, paginaton.limit);

    // Dapatkan koneksi database
    let mut conn = get_db_connection(&pool).await?;

    // search values
    let search_term = paginaton.search.unwrap_or_default();
    let search_like = format!("%{}%", search_term);

    let total_query = if search_term.is_empty() {
        "SELECT COUNT(*) FROM category"
    } else {
        "SELECT COUNT(*) FROM category WHERE title LIKE ?"
    };

    // Hitung total category
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

    // query category
    let query_category = if search_term.is_empty() {
        "SELECT id, title FROM category LIMIT ? OFFSET ?"
    } else {
        "SELECT id, title FROM category WHERE title LIKE ? LIMIT ? OFFSET ?"
    };

    // get data category results
    let category: Vec<CategoryResponse> = if search_term.is_empty() {
        conn.exec_map(
            query_category,
            (limit, offset),
            |(id, title): (u64, String)| CategoryResponse { id, title },
        )
        .await
        .map_err(|_| {
            error(
                "Gagal mengambil data category",
                StatusCode::INTERNAL_SERVER_ERROR,
            )
        })?
    } else {
        conn.exec_map(
            query_category,
            (&search_like, limit, offset),
            |(id, title): (u64, String)| CategoryResponse { id, title },
        )
        .await
        .map_err(|_| {
            error(
                "Gagal mengambil data category",
                StatusCode::INTERNAL_SERVER_ERROR,
            )
        })?
    };

    Ok((
        StatusCode::OK,
        success_with_pagination(
            "Get category successfully!",
            category,
            PaginationMeta {
                current_page: page,
                limit,
                total: total,
                total_pages: (total as f64 / limit as f64).ceil() as u64,
            },
        ),
    ))
}

// function to get data by id
#[axum::debug_handler]
pub async fn get_category_by_id(
    State(pool): State<Arc<Pool>>,
    auth_user: AuthUser,
    Path(category_id): Path<u64>,
) -> Result<(StatusCode, Json<serde_json::Value>), (StatusCode, Json<serde_json::Value>)> {
    // Check apakah users admin atau bukan
    admin_check(&auth_user)?;

    // Dapatkan koneksi database
    let mut conn = get_db_connection(&pool).await?;

    // Dapatkan data kategori
    let category = conn
        .exec_first::<(u64, String), _, _>(
            "SELECT id, title FROM category WHERE id = ?",
            (category_id,),
        )
        .await;

    match category {
        Ok(Some((id, title))) => {
            let response_category = CategoryResponse { id, title };
            let response = serde_json::json!(response_category);

            Ok((
                StatusCode::OK,
                success("Get data category by id successfully!", response),
            ))
        }
        Ok(None) => Err(error("Category not found", StatusCode::NOT_FOUND)),
        Err(_) => {
            let error = UserError::DatabaseError("Gagal Mengambil Data Kategori");
            let error_json = serde_json::json!({
                "message": error.to_json(),
                "status": "error"
            });

            Err((error.status_code(), Json(error_json)))
        }
    }
}
