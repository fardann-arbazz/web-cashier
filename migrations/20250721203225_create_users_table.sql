-- Add migration script here
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Kasir') NOT NULL DEFAULT 'Kasir'
);