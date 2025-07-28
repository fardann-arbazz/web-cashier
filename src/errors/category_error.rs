use axum::http::StatusCode;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub enum CategoryError {
    DatabaseError(&'static str),
    NotFound(&'static str),
    InvalidPayload(&'static str),
}

#[allow(dead_code)]
impl CategoryError {
    pub fn status_code(&self) -> StatusCode {
        match self {
            CategoryError::DatabaseError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            CategoryError::NotFound(_) => StatusCode::NOT_FOUND,
            CategoryError::InvalidPayload(_) => StatusCode::BAD_REQUEST,
        }
    }

    pub fn to_json(&self) -> serde_json::Value {
        match self {
            CategoryError::DatabaseError(message) => serde_json::json!({
                "error": message,
                "status": "error"
            }),
            CategoryError::NotFound(message) => serde_json::json!({
                "error": message,
                "status": "invalid"
            }),
            CategoryError::InvalidPayload(message) => serde_json::json!({
                "error": message,
                "status": "invalid"
            }),
        }
    }
}
