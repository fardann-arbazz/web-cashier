use serde::{Deserialize, Serialize};
use validator_derive::Validate;

#[derive(Debug, Serialize, Deserialize)]
pub struct CategoryResponse {
    pub id: u64,
    pub title: String,
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct CategoryPayload {
    #[validate(length(min = 3, max = 50, message = "Title harus antara 3-50 karakter"))]
    pub title: String,
}
