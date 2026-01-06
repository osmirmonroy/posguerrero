INSERT INTO product (name, price, description, category) VALUES ('Taco de Asada', 25.0, 'Delicioso taco de carne asada con cebolla y cilantro', 'Tacos');
INSERT INTO product (name, price, description, category) VALUES ('Taco de Pastor', 20.0, 'Taco de cerdo marinado con piña', 'Tacos');
INSERT INTO product (name, price, description, category) VALUES ('Taco de Suadero', 22.0, 'Taco de suadero confitado', 'Tacos');
INSERT INTO product (name, price, description, category) VALUES ('Coca Cola', 30.0, 'Refresco de cola 600ml', 'Bebidas');
INSERT INTO product (name, price, description, category) VALUES ('Boing de Mango', 25.0, 'Jugo de mango 500ml', 'Bebidas');

INSERT INTO extra (name, price) VALUES ('Queso', 5.0);
INSERT INTO extra (name, price) VALUES ('Tortilla de harina', 5.0);
INSERT INTO extra (name, price) VALUES ('Queso Norteño', 5.0);

-- Password for admin is 'admin123'
INSERT INTO users (username, password, role) VALUES ('admin', '$2a$10$YHfc/EwcIw2dyYiRfRQYLOqCfQUR5T3WSaMFTsW4OHOI8uhHRBO/q', 'ADMIN');
-- Password for user is 'user123'
INSERT INTO users (username, password, role) VALUES ('user', '$2a$10$DPaPjK4D23I79VeqMF4.su6Dv6zXTBjk1vO7NMiBgk7cTInkWoVvy', 'USER');
