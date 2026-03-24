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
VALUES ('Tic Tac Toe','Classic 3x3 strategy game', 1); /* Kattis ID:2 - Davids ID: - Noshins ID: */

INSERT INTO games (name, description, max_score)
VALUES ('Guess The Number', 'Guess a number between 1 and 100', 100); /* Kattis ID:3 - Davids ID: - Noshins ID: */

INSERT INTO games (name, description, max_score)
VALUES ('Rock paper scissors', 'Choose rock, paper, or scissors', 100); /* Kattis ID:3 - Davids ID: - Noshins ID: */

/*Achievements till Guess the Number Game*/
INSERT INTO achievements (name, description) VALUES
('First Guess', 'Play your first guess game'), /* Kattis ID:2 - Davids ID: - Noshins ID: */
('Lucky Guess', 'Win in 3 attempts or less'), /* Kattis ID:3 - Davids ID: - Noshins ID: */
('Persistent', 'Win after 10+ attempts'); /* Kattis ID:4 - Davids ID: - Noshins ID: */

/*Achievements till tic-tac-toe Game*/
INSERT INTO achievements (name, description) VALUES
('First Win TTT', 'Win your first Tic Tac Toe game'),
('TTT Streak', 'Win 3 games in a row');

/*Achievements till Rock Paper scissors Game*/
INSERT INTO achievements (name, description) VALUES
('First Win RPS', 'Win your first Rock Paper Scissors game'),
('RPS Champion', 'Win 5 games in a row');

