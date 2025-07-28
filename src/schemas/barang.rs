use mysql_async::prelude::FromRow;
use serde::{Deserialize, Serialize};
use validator_derive::Validate;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct BarangResponse {
    pub id: u64,
    pub nama: String,
    pub harga: u64,
    pub stok: u32,
    pub category_id: u64,
    pub category_title: String,
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct BarangPayload {
    #[validate(length(min = 3, max = 100, message = "Nama harus antara 3-100 karakter"))]
    pub nama: String,

    #[validate(range(min = 1, message = "Harga harus lebih dari 0"))]
    pub harga: u64,

    #[validate(range(min = 1, message = "Stok harus lebih dari 0"))]
    pub stok: u32,

    #[validate(range(min = 1, message = "Category ID harus lebih dari 0"))]
    pub category_id: u64,
}
