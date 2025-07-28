use axum::{
    Json, async_trait,
    extract::FromRequestParts,
    http::{StatusCode, request::Parts},
};

use crate::{errors::user_error::UserError, models::user::Role, utils::jwt::verify_token};

#[allow(dead_code)]
pub struct AuthUser {
    pub user_id: u64,
    pub username: String,
    pub role: Role,
}

#[async_trait]
impl<S> FromRequestParts<S> for AuthUser
where
    S: Send + Sync,
{
    type Rejection = (StatusCode, String);

    async fn from_request_parts(
        parts: &mut Parts,
        _state: &S,
    ) -> Result<Self, (StatusCode, String)> {
        let auth_header = parts
            .headers
            .get("Authorization")
            .and_then(|v| v.to_str().ok());

        let tokens = if let Some(header) = auth_header {
            if header.starts_with("Bearer ") {
                Some(header.trim_start_matches("Bearer ").to_string())
            } else {
                None
            }
        } else {
            None
        };

        let json_response_unauthorized = serde_json::json!({
            "error": "Anda belum login",
            "status": "error"
        });

        let token = match tokens {
            Some(t) => t,
            None => {
                return Err((
                    StatusCode::UNAUTHORIZED,
                    json_response_unauthorized.to_string(),
                ));
            }
        };

        match verify_token(&token) {
            Ok(claims) => Ok(AuthUser {
                user_id: claims.user_id,
                username: claims.sub,
                role: claims.role,
            }),
            Err(_) => {
                let json_response_invalid = serde_json::json!({
                    "error": "Token tidak valid atau kadaluarsa",
                    "status": "error"
                });

                Err((StatusCode::UNAUTHORIZED, json_response_invalid.to_string()))
            }
        }
    }
}

// middleware untuk route khusus admin
pub fn admin_check(auth_user: &AuthUser) -> Result<(), (StatusCode, Json<serde_json::Value>)> {
    if auth_user.role != Role::Admin {
        let error = UserError::Forbidden("Anda bukan admin");
        return Err((error.status_code(), Json(error.to_json())));
    }

    Ok(())
}
