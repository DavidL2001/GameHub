import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      message: "Access token missing"
    });
  }
  const token = authHeader.split(" ")[1] as string;
  try {
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET as string
  ) as unknown as { id: number };
  (req as any).user = decoded;
  next();
} catch (error) {
    return res.status(403).json({
      message: "Invalid token"
    });
  }
};