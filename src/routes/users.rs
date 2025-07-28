use std::sync::Arc;

use axum::{
    Router,
    routing::{delete, get, post, put},
};
use mysql_async::Pool;

use crate::handlers::user::{
    create::users_store,
    delete::delete_user_by_id,
    get::{get_all_user, get_user_by_id},
    update::update_user_by_id,
};

pub fn routes() -> Router<Arc<Pool>> {
    Router::new()
        .route("/users", get(get_all_user))
        .route("/users", post(users_store))
        .route("/users/:id", get(get_user_by_id))
        .route("/users/:id/update", put(update_user_by_id))
        .route("/users/:id/delete", delete(delete_user_by_id))
}
