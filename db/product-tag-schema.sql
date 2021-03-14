USE ecommerce_db;

DROP TABLE IF EXISTS product_tag;

CREATE TABLE product_tag(
id INT AUTO_INCREMENT NOT NULL,
product_id INT,
tag_id INT,
PRIMARY KEY(id),
FOREIGN KEY (product_id) REFERENCES product(id),
FOREIGN KEY (tag_id) REFERENCES tag(id)
)