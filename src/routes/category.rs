use std::sync::Arc;

use axum::{
    Router,
    routing::{delete, get, post, put},
};
use mysql_async::Pool;

use crate::handlers::category::{
    create::categories_store,
    delete::delete_category_by_id,
    get::{get_all_category, get_category_by_id},
    update::update_category_by_id,
};

pub fn routes() -> Router<Arc<Pool>> {
    Router::new()
        .route("/categories", get(get_all_category))
        .route("/categories/:id", get(get_category_by_id))
        .route("/categories", post(categories_store))
        .route("/categories/:id/update", put(update_category_by_id))
        .route("/categories/:id/delete", delete(delete_category_by_id))
}
