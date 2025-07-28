use std::sync::Arc;

use axum::{Json, extract::State, http::StatusCode};
use mysql_async::{Pool, TxOpts, prelude::Queryable};
use uuid::Uuid;
use validator::Validate;

use crate::{
    schemas::{transaction::TransactionPayload, transaction_items::TransactionItemCalculated},
    utils::{
        db::get_db_connection,
        response::{error, success},
    },
};

pub async fn transaction_store(
    State(pool): State<Arc<Pool>>,
    Json(payload): Json<TransactionPayload>,
) -> Result<(StatusCode, Json<serde_json::Value>), (StatusCode, Json<serde_json::Value>)> {
    if let Err(validations_error) = payload.validate() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({
                "error": validations_error,
                "status": "invalid"
            })),
        ));
    }

    // Dapatkan koneksi database
    let mut conn = get_db_connection(&pool).await?;

    let mut tx = conn
        .start_transaction(TxOpts::default())
        .await
        .map_err(|e| {
            error(
                &format!("Gagal memulai transaksi database: {}", e),
                StatusCode::INTERNAL_SERVER_ERROR,
            )
        })?;

    // Hitung total
    let mut total_amount = 0.0;
    let mut calculated_items = Vec::new();

    for item in &payload.items {
        let row: Option<(i64, i64)> = tx
            .exec_first(
                "SELECT harga, stok FROM barang WHERE id = ?",
                (item.product_id,),
            )
            .await
            .map_err(|_| {
                error(
                    "Gagal mengambil data barang",
                    StatusCode::INTERNAL_SERVER_ERROR,
                )
            })?;

        let (price, stock) = match row {
            Some(data) => data,
            None => {
                return Err(error(
                    &format!("Barang dengan id {} tidak ditemukan", item.product_id),
                    StatusCode::BAD_REQUEST,
                ));
            }
        };

        if stock < item.quantity as i64 {
            return Err(error(
                &format!(
                    "Stok tidak cukup untuk produk ID {} (tersisa: {}, diminta: {})",
                    item.product_id, stock, item.quantity
                ),
                StatusCode::BAD_REQUEST,
            ));
        }

        let price_f64 = price as f64;
        let subtotal = price_f64 * item.quantity as f64;
        total_amount += subtotal;

        calculated_items.push(TransactionItemCalculated {
            product_id: item.product_id,
            quantity: item.quantity,
            price: price_f64,
            subtotal,
        });
    }

    if payload.paid_amount < total_amount {
        return Err(error(
            &format!(
                "Jumlah yang dibayarkan ({}) kurang dari total belanja ({})",
                payload.paid_amount, total_amount
            ),
            StatusCode::BAD_REQUEST,
        ));
    }

    let change_amount = payload.paid_amount - total_amount;
    let invoice_number = format!("INV-{}", Uuid::new_v4());
    let status = "paid";

    tx.exec_drop(
        r#"
        INSERT INTO transactions (invoice_number, cashier_id, total_amount, payment_method, paid_amount, change_amount, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        "#,
        (
            &invoice_number,
            payload.cashier_id,
            total_amount,
            &payload.payment_method,
            payload.paid_amount,
            change_amount,
            status,
        ),
    )
    .await
    .map_err(|e| {
        error(
            &format!("Gagal menyimpan transaksi: {}", e),
            StatusCode::INTERNAL_SERVER_ERROR,
        )
    })?;

    let transaction_id = tx.last_insert_id();

    // Gunakan hasil perhitungan sebelumnya
    for item in &calculated_items {
        tx.exec_drop(
            r#"
            INSERT INTO transaction_items (transaction_id, product_id, price, quantity, subtotal)
            VALUES (?, ?, ?, ?, ?)
            "#,
            (
                transaction_id,
                item.product_id,
                item.price,
                item.quantity,
                item.subtotal,
            ),
        )
        .await
        .map_err(|e| {
            error(
                &format!("Gagal menyimpan item transaksi: {}", e),
                StatusCode::INTERNAL_SERVER_ERROR,
            )
        })?;

        tx.exec_drop(
            "UPDATE barang SET stok = stok - ? WHERE id = ? AND stok >= ?",
            (item.quantity, item.product_id, item.quantity),
        )
        .await
        .map_err(|_| error("Gagal mengurangi stock", StatusCode::INTERNAL_SERVER_ERROR))?;
    }

    tx.commit().await.map_err(|e| {
        error(
            &format!("Gagal commit transaksi: {}", e),
            StatusCode::INTERNAL_SERVER_ERROR,
        )
    })?;

    Ok((
        StatusCode::CREATED,
        success(
            "Transaksi berhasil dibuat",
            serde_json::json!({
                "transaction": {
                    "id": transaction_id,
                    "invoice_number": invoice_number,
                    "cashier_id": payload.cashier_id,
                    "total_amount": total_amount,
                    "paid_amount": payload.paid_amount,
                    "change_amount": change_amount,
                    "payment_method": payload.payment_method,
                    "status": status
                },
                "items": calculated_items
            }),
        ),
    ))
}
