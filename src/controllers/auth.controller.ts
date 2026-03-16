import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { generateToken } from "../config/jwt";

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
    res.json({
      token
    });
  } catch (error: any) {
    res.status(401).json({
      message: error.message
    });
  }
};