use std::sync::Arc;

use axum::{
    Json,
    extract::{Path, Query, State},
    http::StatusCode,
};
use mysql_async::{Pool, prelude::Queryable};
use serde_json::json;

use crate::{
    errors::user_error::UserError,
    middleware::auth_middleware::{AuthUser, admin_check},
    models::user::Role,
    schemas::{
        pagination::{Pagination, PaginationMeta},
        user::UsersResponse,
    },
    utils::{
        calculate_pagination::calculate_pagination,
        db::get_db_connection,
        parse_role::parse_role_str,
        response::{error, success, success_with_pagination},
    },
};

// Get all user from database
pub async fn get_all_user(
    State(pool): State<Arc<Pool>>,
    Query(pagination): Query<Pagination>,
    auth_user: AuthUser,
) -> Result<(StatusCode, Json<serde_json::Value>), (StatusCode, Json<serde_json::Value>)> {
    // check apakah users admin atau bukan
    admin_check(&auth_user)?;

    // mengambil value pagination
    let (page, limit, offset) = calculate_pagination(pagination.page, pagination.limit);
    let mut conn = get_db_connection(&pool).await?;

    let search_term = pagination.search.unwrap_or_default();
    let search_like = format!("%{}%", search_term);

    // membuat query untuk menghitung seluruh data users
    let total_query = if search_term.is_empty() {
        "SELECT COUNT(*) FROM users"
    } else {
        "SELECT COUNT(*) FROM users WHERE username LIKE ?"
    };

    let total_baru: u64 = if search_term.is_empty() {
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

    // membuat query untuk mengambil data users
    let query_users = if search_term.is_empty() {
        "SELECT id, username, role FROM users LIMIT ? OFFSET ?"
    } else {
        "SELECT id, username, role FROM users WHERE username LIKE ? LIMIT ? OFFSET ?"
    };

    let users: Vec<UsersResponse> = if search_term.is_empty() {
        conn.exec_map(
            query_users,
            (limit, offset),
            |(id, username, role): (u64, String, String)| UsersResponse {
                id,
                username,
                role: parse_role_str(&role),
            },
        )
        .await
        .map_err(|_| {
            error(
                "Gagal mengambil data users",
                StatusCode::INTERNAL_SERVER_ERROR,
            )
        })?
    } else {
        conn.exec_map(
            query_users,
            (&search_like, limit, offset),
            |(id, username, role): (u64, String, String)| UsersResponse {
                id,
                username,
                role: parse_role_str(&role),
            },
        )
        .await
        .map_err(|_| {
            error(
                "Gagal mengambil data users",
                StatusCode::INTERNAL_SERVER_ERROR,
            )
        })?
    };

    // membuat query untuk menghitung total admin
    let total_admin: u64 = conn
        .exec_first("SELECT COUNT(*) FROM users WHERE role = 'admin'", ())
        .await
        .unwrap_or(Some(0))
        .unwrap_or(0);

    // membuat query untuk menghitung total kasir
    let total_kasir: u64 = conn
        .exec_first("SELECT COUNT(*) FROM users WHERE role = 'kasir'", ())
        .await
        .unwrap_or(Some(0))
        .unwrap_or(0);

    let mut response_value = success_with_pagination(
        "Get users successfully!",
        users,
        PaginationMeta {
            current_page: page,
            limit,
            total: total_baru,
            total_pages: (total_baru as f64 / limit as f64).ceil() as u64,
        },
    )
    .0;

    if let serde_json::Value::Object(map) = &mut response_value {
        map.insert("total_admin".to_string(), json!(total_admin));
        map.insert("total_kasir".to_string(), json!(total_kasir));
    }

    Ok((StatusCode::OK, Json(response_value)))
}

// function untuk get data by id
#[axum::debug_handler]
pub async fn get_user_by_id(
    State(pool): State<Arc<Pool>>,
    auth_user: AuthUser,
    Path(user_id): Path<u64>,
) -> Result<(StatusCode, Json<serde_json::Value>), (StatusCode, Json<serde_json::Value>)> {
    // check apakah users admin atau bukan
    if auth_user.role != Role::Admin {
        let error = UserError::Forbidden("Anda bukan admin");
        return Err((error.status_code(), Json(error.to_json())));
    }

    // dapatkan koneksi database
    let mut conn = get_db_connection(&pool).await?;

    // ambil data user berdasarkan id
    let result = conn
        .exec_first::<(u64, String, String), _, _>(
            "SELECT id, username, role FROM users WHERE id = ?",
            (user_id,),
        )
        .await;

    match result {
        Ok(Some((id, username, role_str))) => {
            let role = parse_role_str(&role_str);
            let user_response = UsersResponse { id, username, role };
            let json_response = serde_json::json!(user_response);

            Ok((
                StatusCode::OK,
                success("Get users by id successfully!", json_response),
            ))
        }
        Ok(None) => {
            let error_response = serde_json::json!({
                "error": "User not found",
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
