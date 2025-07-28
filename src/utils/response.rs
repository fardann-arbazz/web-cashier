use axum::{Json, http::StatusCode};
use serde::Serialize;
use serde_json::json;

use crate::schemas::pagination::PaginationMeta;

pub fn success<T: Serialize>(message: &str, data: T) -> Json<serde_json::Value> {
    Json(json!({
        "message": message,
        "status": "success",
        "data": data
    }))
}

pub fn success_with_pagination<T: Serialize>(
    message: &str,
    data: Vec<T>,
    pagination: PaginationMeta,
) -> Json<serde_json::Value> {
    Json(json!({
        "message": message,
        "status": "success",
        "data": data,
        "pagination": pagination
    }))
}

pub fn error(message: &str, code: StatusCode) -> (StatusCode, Json<serde_json::Value>) {
    (
        code,
        Json(json!({
            "error": message,
            "status": "error"
        })),
    )
}
