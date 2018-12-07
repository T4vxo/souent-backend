import { Request, Response } from "express";
import utils from "../utils";
import { verifyToken } from "../auth/google_auth";
import { query } from "../db";

/**
 * @author Daniel Grigore
 */

export default async function (req: Request, res: Response) {
  console.log("bodfy:", req.body);

  if (!utils.assertParamsWithResponse([
    'accessToken'
  ], req.body, res)) {
    return;
  }

  let { accessToken } = req.body;

  let user = await verifyToken(accessToken);
  if (user == null) {
    return res.status(400).end(JSON.stringify({ result: "error", error: 'invalid accesstoken' }))
  }

  let result: any[] = await query('SELECT id FROM user WHERE email = ?', user.userEmail, {
    forceArray: true
  }) as any[]

  if (result.length == 0) {
    await signUp(user)
  }

  res.end(JSON.stringify({
    message_token: 'token ' + accessToken,
  }))

}

async function signUp(user) {
  await query("INSERT INTO user (email, secret) VALUES (?, ?)", [user.userEmail, user.userId])
}