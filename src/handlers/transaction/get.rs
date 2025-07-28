use std::{collections::HashMap, sync::Arc};

use axum::{
    Json,
    extract::{Query, State},
    http::StatusCode,
};
use mysql_async::{
    Pool,
    prelude::{FromRow, Queryable},
};

use crate::{
    middleware::auth_middleware::AuthUser,
    models::user::Role,
    schemas::{
        pagination::{Pagination, PaginationMeta},
        transaction::{TransactionFlatRow, TransactionResponse},
        transaction_items::TransactionItemsJoin,
        user::UsersResponse,
    },
    utils::{
        calculate_pagination::calculate_pagination,
        db::get_db_connection,
        response::{error, success_with_pagination},
    },
};

// get all transaction from database
pub async fn get_all_transaction(
    State(pool): State<Arc<Pool>>,
    Query(pagination): Query<Pagination>,
    auth_user: AuthUser,
) -> Result<(StatusCode, Json<serde_json::Value>), (StatusCode, Json<serde_json::Value>)> {
    let (page, limit, offset) = calculate_pagination(pagination.page, pagination.limit);

    let mut conn = get_db_connection(&pool).await?;

    let search_term = pagination.search.unwrap_or_default();
    let search_like = format!("%{}%", search_term);

    // Total count query
    let total_query = match auth_user.role {
        Role::Admin => {
            if search_term.is_empty() {
                "SELECT COUNT(*) FROM transactions".to_string()
            } else {
                "SELECT COUNT(*) FROM transactions WHERE invoice_number LIKE ? OR status LIKE ? OR payment_method LIKE ?".to_string()
            }
        }
        Role::Kasir => {
            if search_term.is_empty() {
                "SELECT COUNT(*) FROM transactions WHERE cashier_id = ?".to_string()
            } else {
                "SELECT COUNT(*) FROM transactions WHERE cashier_id = ? AND (invoice_number LIKE ? OR status LIKE ? OR payment_method LIKE ?)".to_string()
            }
        }
    };

    // Execute total query
    let total: u64 = match auth_user.role {
        Role::Admin => {
            if search_term.is_empty() {
                conn.query_first(total_query)
                    .await
                    .unwrap_or(Some(0))
                    .unwrap_or(0)
            } else {
                conn.exec_first(total_query, (&search_like, &search_like, &search_like))
                    .await
                    .unwrap_or(Some(0))
                    .unwrap_or(0)
            }
        }
        Role::Kasir => {
            if search_term.is_empty() {
                conn.exec_first(total_query, (&auth_user.user_id,))
                    .await
                    .unwrap_or(Some(0))
                    .unwrap_or(0)
            } else {
                conn.exec_first(
                    total_query,
                    (&auth_user.user_id, &search_like, &search_like, &search_like),
                )
                .await
                .unwrap_or(Some(0))
                .unwrap_or(0)
            }
        }
    };

    // Shared query template
    let mut query_transaction = String::from(
        r#"
        SELECT
            t.id AS transaction_id,
            t.invoice_number,
            t.total_amount,
            t.payment_method,
            t.paid_amount,
            t.change_amount,
            t.status,
            DATE_FORMAT(t.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
            u.id AS cashier_id,
            u.username AS cashier_username,
            ti.id AS transaction_item_id,
            ti.price,
            ti.quantity,
            ti.subtotal,
            b.id AS product_id,
            b.nama AS product_name,
            b.harga AS product_price
        FROM transactions t
        JOIN users u ON t.cashier_id = u.id
        JOIN transaction_items ti ON ti.transaction_id = t.id
        JOIN barang b ON ti.product_id = b.id
    "#,
    );

    let raw_rows: Vec<TransactionFlatRow> = match auth_user.role {
        Role::Admin => {
            if search_term.is_empty() {
                query_transaction.push_str(" ORDER BY t.created_at DESC LIMIT ? OFFSET ?");
                conn.exec_map(
                    query_transaction,
                    (&limit, &offset),
                    TransactionFlatRow::from_row,
                )
                .await
                .map_err(|e| {
                    error(
                        &format!("DB error: {}", e),
                        StatusCode::INTERNAL_SERVER_ERROR,
                    )
                })?
            } else {
                query_transaction.push_str(" WHERE t.invoice_number LIKE ? OR t.status LIKE ? OR t.payment_method LIKE ? ORDER BY t.created_at DESC LIMIT ? OFFSET ?");
                conn.exec_map(
                    query_transaction,
                    (&search_like, &search_like, &search_like, &limit, &offset),
                    TransactionFlatRow::from_row,
                )
                .await
                .map_err(|e| {
                    error(
                        &format!("DB error: {}", e),
                        StatusCode::INTERNAL_SERVER_ERROR,
                    )
                })?
            }
        }
        Role::Kasir => {
            if search_term.is_empty() {
                query_transaction.push_str(
                    " WHERE t.cashier_id = ? ORDER BY t.created_at DESC LIMIT ? OFFSET ?",
                );
                conn.exec_map(
                    query_transaction,
                    (&auth_user.user_id, &limit, &offset),
                    TransactionFlatRow::from_row,
                )
                .await
                .map_err(|e| {
                    error(
                        &format!("DB error: {}", e),
                        StatusCode::INTERNAL_SERVER_ERROR,
                    )
                })?
            } else {
                query_transaction.push_str(" WHERE t.cashier_id = ? AND (t.invoice_number LIKE ? OR t.status LIKE ? OR t.payment_method LIKE ?) ORDER BY t.created_at DESC LIMIT ? OFFSET ?");
                conn.exec_map(
                    query_transaction,
                    (
                        &auth_user.user_id,
                        &search_like,
                        &search_like,
                        &search_like,
                        &limit,
                        &offset,
                    ),
                    TransactionFlatRow::from_row,
                )
                .await
                .map_err(|e| {
                    error(
                        &format!("DB error: {}", e),
                        StatusCode::INTERNAL_SERVER_ERROR,
                    )
                })?
            }
        }
    };

    // Group to TransactionResponse
    let mut transactions_map: HashMap<u64, TransactionResponse> = HashMap::new();
    for row in raw_rows {
        let entry = transactions_map
            .entry(row.transaction_id)
            .or_insert_with(|| TransactionResponse {
                id: row.transaction_id,
                invoice_number: row.invoice_number.clone(),
                cashier: UsersResponse {
                    id: row.cashier_id,
                    username: row.cashier_username.clone(),
                    role: Role::Kasir,
                },
                total_amount: row.get_total_amount().unwrap_or(0.0),
                payment_method: row.payment_method.clone(),
                paid_amount: row.get_paid_amount().unwrap_or(0.0),
                change_amount: row.get_change_amount().unwrap_or(0.0),
                status: row.status.clone(),
                created_at: row.created_at.clone(),
                items: vec![],
            });

        entry.items.push(TransactionItemsJoin {
            transaction_id: row.transaction_id as i64,
            product_id: row.product_id as i64,
            quantity: row.quantity as i32,
            price: row.get_price().unwrap_or(0.0),
            product_name: row.product_name.clone(),
            subtotal: row.get_subtotal().unwrap_or(0.0),
        });
    }

    let transactions: Vec<TransactionResponse> = transactions_map.into_values().collect();

    Ok((
        StatusCode::OK,
        success_with_pagination(
            "Get all transactions successfully!",
            transactions,
            PaginationMeta {
                current_page: page,
                limit,
                total,
                total_pages: (total as f64 / limit as f64).ceil() as u64,
            },
        ),
    ))
}
