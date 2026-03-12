/* Schema för reviews i MongoDB */

import mongoose, { Schema, Document } from "mongoose";

//Våra interface regler för reviews för typescript
export interface IReview extends Document {
  userId: number;
  gameId: number;
  rating: number;
  comment?: string;
  createdAt: Date;
}
//Vårt mongoDB schema för reviews
const ReviewSchema: Schema = new Schema({
  userId: {
    type: Number,
    required: true
  },
  gameId: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IReview>("Review", ReviewSchema);