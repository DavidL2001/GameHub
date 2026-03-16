import pool from "../config/mysql";
import bcrypt from "bcrypt";
import { RowDataPacket } from "mysql2";

//För att undvika att ha 'any', så gör jag ett interface som berättar till TS vad för värden den ska förvänta sig
interface User extends RowDataPacket {
  id: number;
  username: string;
  email: string;
  password_hash: string;
}

//1. Registration: Hashar våra lösenord med 10 salt och hanterar felmeddelande för redan använd email
export const registerUser = async (
  username: string,
  email: string,
  password: string
) => {
    const [existingUsers] = await pool.query<User[]>(
    "SELECT id FROM users WHERE email = ?",
    [email]
  );
  if (existingUsers.length > 0) {
    throw new Error("Email already registered");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
    [username, email, hashedPassword]
  );
  return result;
};

//2. Inloggning: Hanterar också fel användare/lösenord och hindrar att det hashade lösenordet returneras
export const loginUser = async (email: string, password: string) => {
  const [rows] = await pool.query<User[]>(
    "SELECT id, username, email, password_hash FROM users WHERE email = ?",
    [email]
  );
  const user = rows[0];
  if (!user) {
    throw new Error("User not found");
  }
  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    throw new Error("Invalid password");
  }
  const { password_hash, ...safeUser } = user;
  return safeUser;
};