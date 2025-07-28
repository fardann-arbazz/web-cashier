use std::sync::Arc;

use axum::{
    Router,
    routing::{get, post},
};
use mysql_async::Pool;

use crate::handlers::transaction::{create::transaction_store, get::get_all_transaction};

pub fn routes() -> Router<Arc<Pool>> {
    Router::new()
        .route("/transaction", get(get_all_transaction))
        .route("/transaction", post(transaction_store))
}
