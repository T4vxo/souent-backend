import { query, db } from "../db";

/**
 * Generates a unique, 1024-character authentication token.
 */
export async function generateToken() {
  let token = ""
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  for (let i = 0; i < 1024; i++) {
    token += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  if (!(await isTokenUnique(token))) {
    return await generateToken()
  }
  return token
}

/**
 * Generates an unique auth token and applies it for a specific user.
 */
export async function generateTokenForUser(userId: any) {
  let token = await generateToken();
  await query(
    `UPDATE user SET auth_token=? WHERE id=?`,
    [ token, userId ]
  );
  return token;
}
/**
 * @returns Whether there is an existing token in the database.
 */
export async function isTokenUnique(token) {
  return (
    await query("SELECT '1' FROM user WHERE auth_token = ?",
      [token],
      {
        forceArray: true
      }
    ) as any[]
  ).length == 0;
}
