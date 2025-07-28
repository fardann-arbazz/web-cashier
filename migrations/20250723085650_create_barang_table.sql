-- Add migration script here
CREATE TABLE barang (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama VARCHAR(100) NOT NULL,
    harga DECIMAL(10,2) NOT NULL,
    stok INT NOT NULL,
    category_id INT NOT NULL,
    
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE
);
