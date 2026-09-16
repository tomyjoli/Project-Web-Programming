DROP TABLE IF EXISTS REVIEW;
DROP TABLE IF EXISTS PREPARATION_STEP;
DROP TABLE IF EXISTS RECIPE_INGREDIENT;
DROP TABLE IF EXISTS RECIPE;
DROP TABLE IF EXISTS INGREDIENT;
DROP TABLE IF EXISTS USER;

CREATE TABLE USER (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE INGREDIENT (
    ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
    ingredient_name VARCHAR(100) NOT NULL,
    alcohol_degree FLOAT DEFAULT 0.0,
    category_name VARCHAR(50) NOT NULL
);

CREATE TABLE RECIPE (
    recipe_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    photo_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE CASCADE,
    glass_name VARCHAR(50) NOT NULL,
    capacity_cl INT NOT NULL
);

CREATE TABLE RECIPE_INGREDIENT (
    recipe_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantity DECIMAL(5,2) NOT NULL,
    unit_of_measure VARCHAR(20) NOT NULL,
    PRIMARY KEY (recipe_id, ingredient_id),
    FOREIGN KEY (recipe_id) REFERENCES RECIPE(recipe_id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES INGREDIENT(ingredient_id)
);

CREATE TABLE PREPARATION_STEP (
    step_id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    step_number INT NOT NULL,
    instruction TEXT NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES RECIPE(recipe_id) ON DELETE CASCADE
);

CREATE TABLE REVIEW (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    recipe_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES RECIPE(recipe_id) ON DELETE CASCADE
);

INSERT INTO USER (user_id, username, email, password) VALUES
(1, 'Antonin', 'antonin@example.com', 'password123'),
(2, 'Tom', 'tom@example.com', 'password123'),
(3, 'Delphine', 'delphine@example.com', 'password123'),
(4, 'Eliot', 'eliot@example.com', 'password123'),
(5, 'Olivier', 'olivier@example.com', 'password123');

INSERT INTO INGREDIENT (ingredient_id, ingredient_name, alcohol_degree, category_name) VALUES
(1, 'Vodka', 40.0, 'Alcohol'),
(2, 'White rum', 37.5, 'Alcohol'),
(3, 'Pineapple juice', 0.0, 'Juice'),
(4, 'Grenadine', 0.0, 'Syrup'),
(5, 'Lime juice', 0.0, 'Juice');

INSERT INTO RECIPE (recipe_id, user_id, title, description, photo_url, glass_name, capacity_cl) VALUES
(1, 1, 'Pineapple Vodka', 'A fresh cocktail combining vodka, pineapple and lime.', 'https://example.com/pineapple-vodka.jpg', 'Highball', 30),
(2, 2, 'Rum Sunrise', 'A fruity rum cocktail with pineapple and grenadine.', 'https://example.com/rum-sunrise.jpg', 'Hurricane', 30),
(3, 3, 'Lime Grenadine Fizz', 'A bright vodka cocktail with lime and grenadine.', 'https://example.com/lime-grenadine-fizz.jpg', 'Tumbler', 25),
(4, 4, 'Tropical Rum Cooler', 'A refreshing blend of white rum, pineapple and lime.', 'https://example.com/tropical-rum-cooler.jpg', 'Collins', 35),
(5, 5, 'Five Ingredient Punch', 'A balanced punch made with all five available ingredients.', 'https://example.com/five-ingredient-punch.jpg', 'Punch glass', 40);

INSERT INTO RECIPE_INGREDIENT (recipe_id, ingredient_id, quantity, unit_of_measure) VALUES
(1, 1, 4.00, 'cl'),
(1, 3, 12.00, 'cl'),
(1, 5, 2.00, 'cl'),
(2, 2, 5.00, 'cl'),
(2, 3, 12.00, 'cl'),
(2, 4, 1.00, 'cl'),
(3, 1, 4.00, 'cl'),
(3, 5, 3.00, 'cl'),
(3, 4, 1.00, 'cl'),
(4, 2, 5.00, 'cl'),
(4, 3, 15.00, 'cl'),
(4, 5, 2.00, 'cl'),
(5, 1, 3.00, 'cl'),
(5, 2, 3.00, 'cl'),
(5, 3, 15.00, 'cl'),
(5, 4, 1.00, 'cl'),
(5, 5, 2.00, 'cl');

INSERT INTO PREPARATION_STEP (step_id, recipe_id, step_number, instruction) VALUES
(1, 1, 1, 'Shake the vodka, pineapple juice and lime juice with ice, then strain into the glass.'),
(2, 2, 1, 'Shake the white rum and pineapple juice with ice, then add grenadine before serving.'),
(3, 3, 1, 'Shake the vodka and lime juice with ice, then pour over ice and add grenadine.'),
(4, 4, 1, 'Fill the glass with ice, add the white rum and pineapple juice, then finish with lime juice.'),
(5, 5, 1, 'Shake the vodka, white rum, pineapple juice and lime juice with ice, then add grenadine.');

INSERT INTO REVIEW (review_id, user_id, recipe_id, rating, comment) VALUES
(1, 2, 1, 5, 'Fresh, fruity and well balanced.'),
(2, 3, 2, 4, 'The pineapple and grenadine work very well together.'),
(3, 4, 3, 4, 'A bright cocktail with a pleasant lime taste.'),
(4, 5, 4, 5, 'Very refreshing and easy to drink.'),
(5, 1, 5, 5, 'A complete and fruity punch with a nice citrus finish.');