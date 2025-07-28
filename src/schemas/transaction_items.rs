use serde::{Deserialize, Serialize};
use validator_derive::Validate;

use crate::schemas::barang::BarangResponse;

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct TransactionItemsPayload {
    #[validate(range(min = 1, message = "Product ID harus lebih dari 0"))]
    pub product_id: i64,

    #[validate(range(min = 1, message = "Jumlah beli harus lebih dari 0"))]
    pub quantity: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TransactionItemCalculated {
    pub product_id: i64,
    pub quantity: i32,
    pub price: f64,
    pub subtotal: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TransactionItemResponse {
    pub id: u64,
    pub product: BarangResponse,
    pub price: f64,
    pub quantity: i32,
    pub subtotal: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TransactionItemsJoin {
    pub transaction_id: i64,
    pub product_id: i64,
    pub product_name: String,
    pub quantity: i32,
    pub price: f64,
    pub subtotal: f64,
}
