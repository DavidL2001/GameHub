import pool from "../config/mysql";
import { RowDataPacket } from "mysql2";

// Interface så TS vet vad den ska förvänta sig
interface Achievement extends RowDataPacket {
  name: string;
  description: string;
  earned_at: Date;
}

//1. Hämta achievement för en user med ID (JOIN)
export const getAchievementsByUser = async (userId: number) => {
  const [rows] = await pool.query<Achievement[]>(
    `
    SELECT 
      achievements.name,
      achievements.description,
      user_achievements.earned_at
    FROM user_achievements
    JOIN achievements 
      ON user_achievements.achievement_id = achievements.id
    WHERE user_achievements.user_id = ?
    ORDER BY user_achievements.earned_at DESC
    `,
    [userId]
  );
  return rows || [];
};