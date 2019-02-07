import { Request, Response, NextFunction } from "express";
import AuthRequest from "../models/AuthRequest";
import { query } from "../db";

/**
 * Authorizes user's authentication token, populates the "user" field in subsequent AuthRequests.
 * @author Johan Svensson
 */
export async function authorize(req: AuthRequest, res: Response, next: NextFunction) {
  let auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).json({
      message: 'provide an auth header'
    })
  }

  let authToken = /^bearer (.+)/i.exec(auth)

  if (authToken.length != 2) {
    return res.status(401).json({
      message: 'provide a bearer token'
    })
  }

  let userId = await query(
    `SELECT id FROM user WHERE auth_token = ?`,
    [authToken[1]],
    {
      forceArray: false,
      skipObjectIfSingleResult: true
    }
  )

  if (!userId) {
    return res.status(401).json({
      message: 'invalid auth token'
    })
  }

  req.user = {
    id: userId
  }

  next();
}

