CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    permission_id SERIAL PRIMARY KEY,
    permission_name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role_permissions (
    role_permission_id SERIAL PRIMARY KEY,
    role_id INT REFERENCES roles(role_id),
    permission_id INT REFERENCES permissions(permission_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id SERIAL NOT NULL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    address TEXT,
    phone_number VARCHAR(15),
    role_id INT REFERENCES roles(role_id) ON DELETE CASCADE ON UPDATE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at BOOLEAN DEFAULT FALSE
);

CREATE TABLE riders (
    id SERIAL NOT NULL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    vehicle_details VARCHAR(255),
    status VARCHAR(20) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at BOOLEAN DEFAULT FALSE
);

CREATE TABLE pending_registrations_rider (
    id SERIAL NOT NULL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    address TEXT,
    phone_number VARCHAR(15),
    role_id INT,
    vehicle_details VARCHAR(255)
);

CREATE TABLE pending_registrations_ownerRes (
  id SERIAL PRIMARY KEY,
  username VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  first_name VARCHAR,
  last_name VARCHAR,
  address TEXT,
  phone_number VARCHAR,
  category VARCHAR,
  role_id INT,
  restaurant_name VARCHAR,
  restaurant_address TEXT,
  restaurant_phone_number VARCHAR(15),
 delivery_fees DECIMAL(5,2) DEFAULT 0.00 ,
   image_url TEXT, 

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE restaurants (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  user_id INT,
  address TEXT,
  category VARCHAR,
  phone_number VARCHAR,
  rating DECIMAL(5,2) DEFAULT 0.00,
  image_url TEXT, 
  delivery_fees DECIMAL(3,2) DEFAULT 0.00 ,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE orders (
    id SERIAL NOT NULL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    restaurant_id INT REFERENCES restaurants(id) ON DELETE SET NULL ON UPDATE CASCADE,
    rider_id INT DEFAULT NULL REFERENCES riders(id) ON DELETE SET NULL ON UPDATE CASCADE,
    total_price DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,

    status VARCHAR(20) DEFAULT 'Pending',
    delivery_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at BOOLEAN DEFAULT FALSE

);

CREATE TABLE order_items (
    id SERIAL NOT NULL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
    menu_item_id INT REFERENCES menu_items(id) ON DELETE SET NULL ON UPDATE CASCADE,
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at BOOLEAN DEFAULT FALSE
);

CREATE TABLE menu_items (
    id SERIAL NOT NULL PRIMARY KEY,
    restaurant_id INT REFERENCES restaurants(id) ON DELETE CASCADE ON UPDATE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    sub_category VARCHAR(50),
    image_url TEXT,
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at BOOLEAN DEFAULT FALSE
);

CREATE TABLE carts (
    id SERIAL NOT NULL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    restaurant_id INT DEFAULT NULL REFERENCES restaurants(id) ON DELETE CASCADE ON UPDATE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at BOOLEAN DEFAULT FALSE
);

CREATE TABLE cart_items (
    id SERIAL NOT NULL PRIMARY KEY,
    cart_id INT REFERENCES carts(id) ON DELETE CASCADE ON UPDATE CASCADE,
    menu_item_id INT REFERENCES menu_items(id) ON DELETE CASCADE ON UPDATE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at BOOLEAN DEFAULT FALSE,
    CONSTRAINT unique_cart_menu_item UNIQUE (cart_id, menu_item_id)
);


CREATE TABLE reviews (
    id SERIAL NOT NULL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        order_id INT REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
    restaurant_id INT REFERENCES restaurants(id) ON DELETE CASCADE ON UPDATE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at BOOLEAN DEFAULT FALSE
)
