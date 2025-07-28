use std::sync::Arc;

use axum::{
    Router,
    routing::{delete, get, post, put},
};
use mysql_async::Pool;

use crate::handlers::barang::{
    create::barang_store,
    delete::delete_barang_by_id,
    get::{get_all_barang, get_barang_by_id},
    update::update_barang_by_id,
};

pub fn routes() -> Router<Arc<Pool>> {
    Router::new()
        .route("/barang", get(get_all_barang))
        .route("/barang/:id", get(get_barang_by_id))
        .route("/barang", post(barang_store))
        .route("/barang/:id/delete", delete(delete_barang_by_id))
        .route("/barang/:id/update", put(update_barang_by_id))
}
