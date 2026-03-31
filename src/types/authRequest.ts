/* Extendar Express Request för att undvika 'any' används till authenticated users */

import { Request } from "express";
import { JwtUser } from "./user";

export interface AuthRequest extends Request {
  user: JwtUser;
}