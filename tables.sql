-- SQL Script to create 'account' and 'product' tables

-- Create 'account' table
CREATE TABLE account (
    username VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255) NOT NULL
);

-- Create 'product' table
CREATE TABLE product (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    owner VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (owner) REFERENCES account(username)
);
