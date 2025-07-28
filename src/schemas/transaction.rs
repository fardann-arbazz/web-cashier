use crate::{
    schemas::{
        transaction_items::{TransactionItemsJoin, TransactionItemsPayload},
        user::UsersResponse,
    },
    validations::transaction::validate_payment_method,
};
use mysql_async::prelude::FromRow;
use serde::{Deserialize, Serialize};
use validator_derive::Validate;

#[derive(Debug, Serialize, Deserialize)]
pub struct TransactionResponse {
    pub id: u64,
    pub invoice_number: String,
    pub cashier: UsersResponse,
    pub total_amount: f64,
    pub payment_method: String,
    pub paid_amount: f64,
    pub change_amount: f64,
    pub status: String,
    pub created_at: String, // ISO 8601 atau gunakan chrono::DateTime
    pub items: Vec<TransactionItemsJoin>,
}

#[derive(Debug, FromRow)]
#[allow(dead_code)]
pub struct TransactionFlatRow {
    // transaksi
    pub transaction_id: u64,
    pub invoice_number: String,
    pub total_amount: String, // ← Ubah ke String untuk handle DECIMAL dari MySQL
    pub payment_method: String,
    pub paid_amount: String,   // ← Ubah ke String
    pub change_amount: String, // ← Ubah ke String
    pub status: String,
    pub created_at: String,

    // cashier
    pub cashier_id: u64,
    pub cashier_username: String,

    // item
    pub transaction_item_id: u64,
    pub price: String, // ← Ubah ke String
    pub quantity: u32,
    pub subtotal: String, // ← Ubah ke String

    // product
    pub product_id: u64,
    pub product_name: String, // ← Sesuaikan dengan alias di query
    pub product_price: i32,   // ← Sesuaikan dengan tipe di database
}

#[allow(dead_code)]
impl TransactionFlatRow {
    // Helper methods untuk konversi string ke numeric
    pub fn get_total_amount(&self) -> Result<f64, Box<dyn std::error::Error>> {
        self.total_amount.parse::<f64>().map_err(|e| e.into())
    }

    pub fn get_paid_amount(&self) -> Result<f64, Box<dyn std::error::Error>> {
        self.paid_amount.parse::<f64>().map_err(|e| e.into())
    }

    pub fn get_change_amount(&self) -> Result<f64, Box<dyn std::error::Error>> {
        self.change_amount.parse::<f64>().map_err(|e| e.into())
    }

    pub fn get_price(&self) -> Result<f64, Box<dyn std::error::Error>> {
        self.price.parse::<f64>().map_err(|e| e.into())
    }

    pub fn get_subtotal(&self) -> Result<f64, Box<dyn std::error::Error>> {
        self.subtotal.parse::<f64>().map_err(|e| e.into())
    }
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct TransactionPayload {
    #[validate(range(min = 1, message = "Cashier ID harus lebih dari 0"))]
    pub cashier_id: u64,

    #[validate(range(min = 1, message = "Pembayaran harus lebih dari 0"))]
    pub paid_amount: f64,

    #[validate(custom = "validate_payment_method")]
    pub payment_method: String,

    pub items: Vec<TransactionItemsPayload>,
}
