import Review, { IReview } from "../models/review.model";
import pool from "../config/mysql";

//1. Skapa en review (secured)
export const createReview = async (
  userId: number,
  gameId: number,
  rating: number,
  comment: string
) => {
  const review = new Review({
    userId,
    gameId,
    rating,
    comment
  });
  return await review.save();
};

//2. Hämta alla reviews
export const getAllReviews = async () => {
  return await Review.find();
};

//3. Hämta review med ID
export const getReviewById = async (id: string) => {
  return await Review.findById(id);
};

//4. Uppdatera en review (UPPDATERAD)
export const updateReview = async (id: string, comment: string, rating: number) => {
  // Backend validation, stoppar användaren från att gå över 5 i rating
  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }
  return await Review.findByIdAndUpdate(
    id,
    { comment, rating },
    { new: true }
  );
};

//5. Ta bort en review
export const deleteReview = async (id: string) => {
  return await Review.findByIdAndDelete(id);
};

//6. Hämta alla reviews till ett spel med spel ID (MongoDB JOIN med MySQL för att hämta username)
export const getReviewsByGameId = async (gameId: number) => {
  // Hämtar reviews from MongoDB
  const reviews = await Review.find({ gameId }).sort({ createdAt: -1 }); //Sorterar senaste inlägg först
  // Hämtar userID
  const userIds = reviews.map(r => r.userId);
  // Hämtar username från MySQL
  const [users] = await pool.query<any[]>(
    `SELECT id, username FROM users WHERE id IN (?)`,
    [userIds]
  );
  // UserID blir Username (mapping)
  const userMap: Record<number, string> = {};
  users.forEach(user => {
    userMap[user.id] = user.username;
  });
  // Lägger till Username till reviews istället för UserID
  const reviewsWithUsername = reviews.map(r => ({
    ...r.toObject(),
    username: userMap[r.userId] || "Unknown"
  }));
  return reviewsWithUsername;
};

/* Källa och inspiration för MongoDB & MySQL mapping: https://dunglai.github.io/2017/06/30/mongodbmapping/ + ChatGPT*/