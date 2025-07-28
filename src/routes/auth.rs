use std::sync::Arc;

use axum::{
    Router,
    routing::{delete, get, post},
};
use mysql_async::Pool;

use crate::handlers::auth::{get_me, login, logout};

pub fn routes() -> Router<Arc<Pool>> {
    Router::new()
        .route("/login", post(login))
        .route("/logout", delete(logout))
        .route("/get/me", get(get_me))
}
