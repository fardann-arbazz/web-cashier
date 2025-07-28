use crate::errors::user_error::UserError;
use axum::{Json, http::StatusCode};
use mysql_async::Pool;

pub async fn get_db_connection(
    pool: &Pool,
) -> Result<mysql_async::Conn, (StatusCode, Json<serde_json::Value>)> {
    pool.get_conn().await.map_err(|_| {
        let error = UserError::DatabaseError("Gagal Menyambungkan Ke Database");
        (error.status_code(), Json(error.to_json()))
    })
}
