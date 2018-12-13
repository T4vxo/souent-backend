import { query } from "../db";

/**
 * Retrieves the ID of a member with a specific ID. If a record with the specified email
 * does not exist, a new record with the email is inserted, given that the insert argument is true. 
 * @param email The email used to query the user ID.
 * @param insert Whether to allow inserting a member if the email does not exist.
 */
export async function getMemberIdByEmail(email: string, insert = true) {
  console.log("[getMemberIdByEmail] ", email);
  let match = await query(
    `SELECT id FROM user WHERE email = ?`,
    [email],
    {
      forceArray: true,
      skipObjectIfSingleResult: true
    }
  ) as any[];
  console.log("[getMemberIdByEmail] match: ", match);

  if (match.length) {
    return match[0];
  } else if (!insert) {
    //  Not allowed to insert, stop here
    return -1;
  }

  let insertResult = await query(
    `INSERT INTO user (email) VALUES (?)`,
    [email]
  ) as any;

  return insertResult.insertId;
}