use mysql_async::prelude::FromRow;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct TransactionsItems {
    pub id: u64,
    pub trasanction_id: u64,
    pub product_id: u64,
    pub price: f64,
    pub quantity: i64,
    pub subtotal: u64,
}
