use std::sync::Arc;

use axum::Router;
use mysql_async::Pool;

pub fn routes() -> Router<Arc<Pool>> {
    Router::new().route("/", axum::routing::get(|| async { "Welcome to the API!" }))
}
