import pool from "../config/mysql";

//1. Lägg till ett spel
export const createGame = async (name: string, description: string, max_score: number) => {
  const [result] = await pool.query(
    "INSERT INTO games (name, description, max_score) VALUES (?, ?, ?)",
    [name, description, max_score]
  );

  return result;
};

//2. Hämta alla spel
export const getAllGames = async () => {
  const [rows] = await pool.query("SELECT * FROM games");
  return rows;
};

//3. Hämta spel med ID
export const getGameById = async (id: number) => {
  const [rows] = await pool.query(
    "SELECT * FROM games WHERE id = ?",
    [id]
  );
  return rows;
};

//4. Uppdatera ett spel
export const updateGame = async (
  id: number,
  name: string,
  description: string,
  max_score: number
) => {
  const [result] = await pool.query(
    "UPDATE games SET name = ?, description = ?, max_score = ? WHERE id = ?",
    [name, description, max_score, id]
  );
  return result;
};

//5. Ta bort ett spel
export const deleteGame = async (id: number) => {
  const [result] = await pool.query(
    "DELETE FROM games WHERE id = ?",
    [id]
  );
  return result;
};