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
SELECT * FROM games;
SELECT * FROM achievements;

/*Games*/
INSERT INTO games (name, description, max_score)
VALUES ('Tic Tac Toe','Classic 3x3 strategy game', NULL);

INSERT INTO games (name, description, max_score)
VALUES ('Guess The Number', 'Guess a number between 1 and 100', 100);

INSERT INTO games (name, description, max_score)
VALUES ('Rock Paper Scissors','Classic 1v1 game', NULL);

INSERT INTO games (name, description, max_score)
VALUES ('Dice', 'Roll two dice to try your luck', 12);

/* Achievements till Guess the Number Game (ID 1-4) */
/* Standardiserade achievements für alla spel - Noshin */
INSERT INTO achievements (name, description) VALUES
('First Guess', 'Play your first Guess The Number game'),
('Quick Guess', 'Win in 3 attempts or less'),
('Guess Master (5)', 'Win 5 Guess The Number games'),
('Guess Master (10)', 'Win 10 Guess The Number games');

/* Achievements till Tic Tac Toe (ID 5-8) */
INSERT INTO achievements (name, description) VALUES
('First Win TTT', 'Win your first Tic Tac Toe game'),
('Quick Win TTT', 'Win a game in your first 3 moves'),
('TTT Champion (5)', 'Win 5 Tic Tac Toe games'),
('TTT Champion (10)', 'Win 10 Tic Tac Toe games');

/* Achievements till Rock Paper Scissors (ID 9-12) */
INSERT INTO achievements (name, description) VALUES
('First Win RPS', 'Win your first Rock Paper Scissors game'),
('Quick Win RPS', 'Win in first 3 rounds'),
('RPS Champion (5)', 'Win 5 Rock Paper Scissors games'),
('RPS Champion (10)', 'Win 10 Rock Paper Scissors games');

/* Achievements till Dice (ID 13-15) */
INSERT INTO achievements (name, description) VALUES
('First Roll', 'Roll the dice for the first time'),
('Seeing Double', 'Roll a 6+6 (double six)'),
('Unlucky', 'Roll the lowest possible score (1+1)');
