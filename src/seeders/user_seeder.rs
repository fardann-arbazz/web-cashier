use crate::models::user::{Role, User};
use crate::utils::argon2::hash_password;
use mysql_async::Pool;
use mysql_async::prelude::Queryable;

pub async fn seed_users(pool: &Pool) -> Result<(), Box<dyn std::error::Error>> {
    let mut conn = pool.get_conn().await?;

    let mut users = vec![];

    // Generate 19 kasir users
    for i in 3..=20 {
        users.push(User {
            id: i,
            username: format!("kasir{}", i),
            password: hash_password("password123").unwrap(),
            role: Role::Kasir,
        });
    }

    for user in users {
        conn.exec_drop(
            "INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)",
            (user.id, user.username, user.password, user.role.to_string()),
        )
        .await?;
    }

    Ok(())
}
