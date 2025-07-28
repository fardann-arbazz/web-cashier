use serde::{Deserialize, Serialize};
use validator_derive::Validate;

use crate::models::user::Role;

#[derive(Debug, Serialize, Deserialize)]
pub struct UsersResponse {
    pub id: u64,
    pub username: String,
    pub role: Role,
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct UserPayload {
    #[validate(length(min = 3, max = 50, message = "Username harus antara 3-50 karakter"))]
    pub username: String,

    #[validate(length(min = 6, message = "Password harus minimal 6 karakter"))]
    pub password: String,

    pub role: Role,
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct UserUpdatePayload {
    #[validate(length(min = 3, max = 50))]
    pub username: String,

    #[serde(default)]
    #[validate(length(min = 6))]
    pub password: Option<String>,

    pub role: Role,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchQuery {
    pub name: String,
}
