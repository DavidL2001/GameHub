/*Group 4*/
CREATE DATABASE gamehub;
use gamehub;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    max_score INT
);

CREATE TABLE scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    score INT NOT NULL,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (game_id) REFERENCES games(id)
);

CREATE TABLE achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE user_achievements (
    user_id INT NOT NULL,
    achievement_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, achievement_id),

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id)
);

SHOW TABLES;
SELECT * FROM users;

/*Lägg till spel*/
INSERT INTO games (name, description, max_score)
VALUES ('Tic Tac Toe','Classic 3x3 strategy game', 1);

INSERT INTO games (name, description, max_score)
VALUES ('Guess The Number', 'Guess a number between 1 and 100', 100);

/*Achievements till Guess the Number Game*/
INSERT INTO achievements (name, description) VALUES
('First Guess', 'Play your first guess game'),
('Lucky Guess', 'Win in 3 attempts or less'),
('Persistent', 'Win after 10+ attempts');