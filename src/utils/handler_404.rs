use axum::{Json, http::StatusCode, response::IntoResponse};
use serde_json::json;

pub async fn handler_404_json() -> impl IntoResponse {
    (
        StatusCode::NOT_FOUND,
        Json(json!({
            "status": "error",
            "message": "Route not found"
        })),
    )
}
