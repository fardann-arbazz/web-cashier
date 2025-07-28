use validator::ValidationError;

pub fn validate_payment_method(method: &str) -> Result<(), ValidationError> {
    match method {
        "cash" | "debit" | "credit" => Ok(()),
        _ => {
            let mut err = ValidationError::new("Invalid payment method");
            err.message = Some("Metode pembayaran harus cash, debit, atau credit".into());
            Err(err)
        }
    }
}
