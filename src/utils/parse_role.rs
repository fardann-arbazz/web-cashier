use crate::models::user::Role;

// Helper function to parse role
pub fn parse_role_str(role_str: &str) -> Role {
    match role_str.to_lowercase().as_str() {
        "admin" => Role::Admin,
        "kasir" => Role::Kasir,
        _ => Role::Kasir, // default fallback
    }
}
