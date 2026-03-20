import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { generateToken } from "../config/jwt";
import { AuthRequest } from "../types/authRequest";

//1. Registration
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    await authService.registerUser(username, email, password);
    res.status(201).json({
      message: "User registered successfully"
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message
    });
  }
};

//2. Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await authService.loginUser(email, password);
    const token = generateToken(user.id);
    res.json({ token });
  } catch (error: any) {
    res.status(401).json({
      message: error.message
    });
  }
};

//3. Dashboard info
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user.id;
    const user = await authService.getUserById(userId);
    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user"
    });
  }
};