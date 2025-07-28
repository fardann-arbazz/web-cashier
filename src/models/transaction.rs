use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub enum PaymentMethod {
    Cash,
    Qris,
    Debit,
    Credit,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum Status {
    Paid,
    Cancelled,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Transactions {
    pub id: u64,
    pub invoice_number: String,
    pub cashier_id: u64,
    pub total_amount: f64,
    pub discount: f64,
    pub final_amount: f64,
    pub payment_method: PaymentMethod,
    pub paid_amount: f64,
    pub change_amount: f64,
    pub status: Status,
}
