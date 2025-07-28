    use std::env::args;

    use axum::{
        Router,
        http::{Method, header},
    };
    use dotenvy::dotenv;
    use tokio::net::TcpListener;
    use tower_http::cors::{AllowOrigin, CorsLayer};

    use crate::{
        config::database::get_db_pool,
        seeders::{product_seeder::seed_products, user_seeder::seed_users},
        utils::handler_404::handler_404_json,
    };

    mod config;
    mod errors;
    mod handlers;
    mod middleware;
    mod models;
    mod routes;
    mod schemas;
    mod seeders;
    mod utils;
    mod validations;

    #[tokio::main]
    async fn main() {
        dotenv().ok();
        let args: Vec<String> = args().collect();
        let inventory_db = get_db_pool().await;

        // jalankan seeder cargo run -- --seed
        if args.contains(&"--seed".to_string()) {
            // Jalankan seed
            if let Err(e) = seed_products(&inventory_db).await {
                eprintln!("Seeder error: {:?}", e);
            }
            if let Err(e) = seed_users(&inventory_db).await {
                eprintln!("Seeder error: {:?}", e);
            }
            return;
        }

        let cors = CorsLayer::new()
            .allow_origin(AllowOrigin::exact("http://localhost:5173".parse().unwrap()))
            .allow_methods([Method::GET, Method::POST, Method::DELETE, Method::PUT])
            .allow_headers([header::AUTHORIZATION, header::CONTENT_TYPE])
            .allow_credentials(true);

        let app = Router::new()
            .merge(routes::auth::routes())
            .merge(routes::welcome::routes())
            .merge(routes::users::routes())
            .merge(routes::category::routes())
            .merge(routes::barang::routes())
            .merge(routes::transaction::routes())
            .with_state(inventory_db)
            .fallback(handler_404_json)
            .layer(cors);

        println!("Server running on http://localhost:8080");
        let listener = TcpListener::bind("0.0.0.0:8080").await.unwrap();
        axum::serve(listener, app).await.unwrap();
    }
