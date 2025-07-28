use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Barang {
    pub id: u64,
    pub nama: String,
    pub harga: u64,
    pub stok: u32,
    pub category_id: u64,
}
