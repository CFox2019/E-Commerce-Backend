USE ecommerce_db;

DROP TABLE IF EXISTS product;

CREATE TABLE product(
id INT AUTO_INCREMENT NOT NULL,
product_name VARCHAR(40) NOT NULL,
price DECIMAL(5,2)NOT NULL,
stock INT DEFAULT 10 NOT NULL,
category_id INT NOT NULL,
PRIMARY KEY(id),
FOREIGN KEY (category_id) REFERENCES category(id)
)