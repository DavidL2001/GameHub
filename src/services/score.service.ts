import pool from "../config/mysql";

//1. Lägg till ett score till användare & spel (secured)
export const createScore = async (
  userId: number,
  gameId: number,
  score: number
) => {
  const [result] = await pool.query(
    `INSERT INTO scores (user_id, game_id, score)
     VALUES (?, ?, ?)`,
    [userId, gameId, score]
  );
  return result;
};

//2. Hämta alla scores
export const getAllScores = async () => {
  const [rows] = await pool.query("SELECT * FROM scores");
  return rows;
};

//3. Hämta leaderboard (Topp 10) för ett spel
export const getLeaderboardByGame = async (gameId: number) => {
  const [rows] = await pool.query(
    `
    SELECT users.username, scores.score
    FROM scores
    JOIN users ON scores.user_id = users.id
    WHERE scores.game_id = ?
    ORDER BY scores.score DESC
    LIMIT 10
    `,
    [gameId]
  );
  return rows;
};

//4. Ta bort ett score (mest för admin inte användare)
export const deleteScore = async (id: number) => {
  const [result] = await pool.query(
    "DELETE FROM scores WHERE id = ?",
    [id]
  );
  return result;
};