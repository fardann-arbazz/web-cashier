use std::env;

use jsonwebtoken::{Algorithm, DecodingKey, Validation, decode, errors::Result as JwtResult};
use jsonwebtoken::{EncodingKey, Header, encode, errors::Error};
use serde::{Deserialize, Serialize};

use crate::models::user::Role;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub user_id: u64,
    pub role: Role,
    pub exp: usize,
}

pub fn generate_token(user_id: u64, username: String, role: Role) -> Result<String, Error> {
    let expiration = std::time::SystemTime::now()
        .checked_add(std::time::Duration::from_secs(60 * 60 * 24))
        .unwrap()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();

    let claims = Claims {
        sub: username,
        user_id,
        role,
        exp: expiration as usize,
    };

    let secret = env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_ref()),
    )
}

pub fn verify_token(token: &str) -> JwtResult<Claims> {
    decode::<Claims>(
        token,
        &DecodingKey::from_secret(
            env::var("JWT_SECRET")
                .expect("JWT_SECRET must be set")
                .as_ref(),
        ),
        &Validation::new(Algorithm::HS256),
    )
    .map(|data| data.claims)
}
