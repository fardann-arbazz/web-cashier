-- Add migration script here
CREATE TABLE `transaction_items` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `transaction_id` BIGINT UNSIGNED NOT NULL,
    `product_id` INT NOT NULL,
    `price` DECIMAL(12,2) NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `subtotal` DECIMAL(12,2) NOT NULL,

    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES barang(id) ON DELETE CASCADE
);