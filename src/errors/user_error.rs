use axum::http::StatusCode;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub enum UserError {
    Forbidden(&'static str),
    DatabaseError(&'static str),
}

impl UserError {
    pub fn status_code(&self) -> StatusCode {
        match self {
            UserError::Forbidden(_) => StatusCode::FORBIDDEN,
            UserError::DatabaseError(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    pub fn to_json(&self) -> serde_json::Value {
        match self {
            UserError::Forbidden(message) => serde_json::json!({
                "error": message,
                "status": "invalid"
            }),
            UserError::DatabaseError(message) => serde_json::json!({
                "error": message,
                "status": "error"
            }),
        }
    }
}
