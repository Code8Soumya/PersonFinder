CREATE DATABASE IF NOT EXISTS persondb;

USE persondb;

CREATE TABLE
    IF NOT EXISTS person (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        gender VARCHAR(20),
        age INT
    );

CREATE TABLE
    IF NOT EXISTS photo (
        id INT AUTO_INCREMENT PRIMARY KEY,
        person_id INT,
        photo_data MEDIUMBLOB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (person_id) REFERENCES person (id)
    );