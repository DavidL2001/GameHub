import Review, { IReview } from "../models/review.model";

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

//4. Uppdatera en review
export const updateReview = async (id: string, data: Partial<IReview>) => {
  return await Review.findByIdAndUpdate(id, data, { new: true }); //returnerar det nya dokumentet returnNewDocument
};

//5. Ta bort en review
export const deleteReview = async (id: string) => {
  return await Review.findByIdAndDelete(id);
};

//6. Hämta alla reviews till ett spel med spel ID
export const getReviewsByGameId = async (gameId: number) => {
  return await Review.find({ gameId: gameId });
};