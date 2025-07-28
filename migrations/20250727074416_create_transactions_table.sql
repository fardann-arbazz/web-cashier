-- Add migration script here
CREATE TABLE `transactions` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `invoice_number` VARCHAR(50) NOT NULL UNIQUE,
    `cashier_id` INT NOT NULL,
    `total_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,  
    `payment_method` ENUM('cash', 'qris', 'debit', 'credit') NOT NULL DEFAULT 'cash',
    `paid_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00, 
    `change_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00, 
    `status` ENUM('paid', 'cancelled') NOT NULL DEFAULT 'paid',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Optional: relasi ke tabel kasir (users atau employees)
    FOREIGN KEY (cashier_id) REFERENCES users(id) ON DELETE CASCADE
);