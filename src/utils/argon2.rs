use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use password_hash::SaltString;
use rand_core::OsRng;

// Function untuk hash password
pub fn hash_password(password: &str) -> Result<String, password_hash::Error> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();

    let hashed_password = argon2
        .hash_password(password.as_bytes(), &salt)?
        .to_string();

    Ok(hashed_password)
}

// Function untuk verrify password
pub fn verify_password(
    password: &str,
    hashed_password: &str,
) -> Result<bool, password_hash::Error> {
    let parsed_hash = PasswordHash::new(hashed_password)?;

    Ok(Argon2::default()
        .verify_password(password.as_bytes(), &parsed_hash)
        .is_ok())
}
