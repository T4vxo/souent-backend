import { Request, Response } from "express";
import utils from "../utils";
import { verifyToken } from "../auth/google_auth";
import { query } from "../db";
import { generateTokenForUser } from "../auth/auth_token";

/**
 * @author Daniel Grigore
 */

export default async function (req: Request, res: Response) {
  console.log("bodfy:", req.body);

  //  Require a valid Google access token
  if (!utils.assertParamsWithResponse([
    'accessToken'
  ], req.body, res)) {
    return;
  }

  let { accessToken } = req.body;

  let user = await verifyToken(accessToken);
  if (user == null) {
    return res.status(400).json({ result: "error", error: 'invalid accesstoken' });
  }

  let result: any[] = await query('SELECT id FROM user WHERE email = ?', user.userEmail, {
    forceArray: true
  }) as any[]

  let userId: any;

  if (result.length == 0) {
    userId = (await signUp({
      email: user.userEmail
    })).userId;
  } else {
    userId = result[0].id;
  }

  let authToken = await generateTokenForUser(userId);

  res.json({
    authToken
  });
}

/**
 * Inserts a new user into the db.
 * @param user 
 */
async function signUp(user: { email: string }) {
  let insert = await query("INSERT INTO user (email) VALUES (?)", [user.email]) as any

  return {
    userId: insert.insertId
  }
}