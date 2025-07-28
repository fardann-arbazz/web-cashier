use serde::{Deserialize, Serialize};
use sqlx::prelude::{FromRow, Type};

#[derive(Debug, Serialize, Deserialize, Type, PartialEq)]
#[serde(rename_all = "lowercase")]
#[sqlx(type_name = "ENUM('Admin', 'Kasir')")]
pub enum Role {
    Admin,
    Kasir,
}

impl ToString for Role {
    fn to_string(&self) -> String {
        match self {
            Role::Admin => "admin".to_string(),
            Role::Kasir => "kasir".to_string(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: u64,
    pub username: String,
    pub password: String,
    pub role: Role,
}
