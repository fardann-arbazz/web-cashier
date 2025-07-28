use std::sync::Arc;

use axum::{Json, extract::State, http::StatusCode};
use mysql_async::{Pool, prelude::Queryable};
use serde::{Deserialize, Serialize};
use serde_json::json;

use crate::{
    errors::user_error::UserError,
    middleware::auth_middleware::AuthUser,
    schemas::user::UsersResponse,
    utils::{
        argon2::verify_password,
        db::get_db_connection,
        jwt::generate_token,
        parse_role::parse_role_str,
        response::{error, success},
    },
};

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginPayload {
    pub username: String,
    pub password: String,
}

// function untuk login
pub async fn login(
    State(pool): State<Arc<Pool>>,
    Json(payload): Json<LoginPayload>,
) -> (StatusCode, Json<serde_json::Value>) {
    let mut conn = match pool.get_conn().await {
        Ok(conn) => conn,
        Err(_) => {
            let err = json!({ "error": "Failed to connect to the database" });
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(err));
        }
    };

    let result = conn
        .exec_first::<(u64, String, String, String), _, _>(
            "SELECT id, username, password, role FROM users WHERE username = ?",
            (payload.username.clone(),),
        )
        .await;

    match result {
        Ok(Some((id, username, db_password, role_str))) => {
            if verify_password(&payload.password, &db_password)
                .expect("Password verification failed")
            {
                let role = parse_role_str(&role_str);

                let token = generate_token(id, username.clone(), role).unwrap();

                let json_response = serde_json::json!({
                    "token": token,
                    "data": {
                        "id": id,
                        "username": username,
                        "role": role_str
                    },
                    "message": "Login successfull!",
                    "status": "success"
                });

                (StatusCode::OK, Json(json_response))
            } else {
                let error_response = serde_json::json!({
                    "message": "Invalid credentials",
                    "status": "invalid"
                });

                (StatusCode::UNAUTHORIZED, Json(error_response))
            }
        }

        Ok(None) => {
            let error_response = serde_json::json!({
                "error": "User not found",
            });
            (StatusCode::NOT_FOUND, Json(error_response))
        }

        Err(_) => {
            let error_response = serde_json::json!({
                "error": "Failed to connect to the database",
            });
            (StatusCode::INTERNAL_SERVER_ERROR, Json(error_response))
        }
    }
}

// function untuk logout users
pub async fn logout() -> (StatusCode, Json<serde_json::Value>) {
    let json_response = serde_json::json!({
        "message": "Logout successful!",
        "status": "success"
    });

    (StatusCode::OK, Json(json_response))
}

// function untuk mendapatkan data diri
pub async fn get_me(
    State(pool): State<Arc<Pool>>,
    AuthUser {
        user_id,
        role: _,
        username: _,
    }: AuthUser,
) -> Result<(StatusCode, Json<serde_json::Value>), (StatusCode, Json<serde_json::Value>)> {
    // dapatkan koneksi database
    let mut conn = get_db_connection(&pool).await?;

    // dapatkan data users
    let user = conn
        .exec_first::<(u64, String, String), _, _>(
            "SELECT id, username, role FROM users WHERE id = ?",
            (user_id,),
        )
        .await;

    match user {
        Ok(Some((id, username, role_str))) => {
            // convert ke role
            let role = parse_role_str(&role_str);

            let response_user = UsersResponse { id, username, role };
            let response = serde_json::json!(response_user);

            Ok((
                StatusCode::OK,
                success("Get data users by id successfully!", response),
            ))
        }
        Ok(None) => Err(error("Users not found", StatusCode::NOT_FOUND)),
        Err(_) => {
            let error = UserError::DatabaseError("Gagal Mengambil Data Kategori");
            let error_json = serde_json::json!({
                "message": error.to_json(),
                "status": "error"
            });

            Err((error.status_code(), Json(error_json)))
        }
    }
}
