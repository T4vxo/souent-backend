import { Request, Response, NextFunction } from "express";

/**
 * Authorizes with oauth.
 * @author Johan Svensson
 */
export async function authorize(req: Request, res: Response, next: NextFunction) {
  next();
}