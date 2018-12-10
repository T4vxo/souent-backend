import { Response, Request } from "express";
import { query } from "../db";

/**
 * Checks user role before handling a request. Ends the request with 403 FORBIDDEN if the required
 * role does not match that of the user's.
 * @param role Required role. "admin" for site administrators, "member" for any member of a social enterprise (where the public ID must be part of the path parameters as :enterpriseId), "contributor" for any signed-in user.
 * @returns Whether the validation succeeded.
 */
export async function requireRoleWithResponse(role: 'admin' | 'member' | 'contributor', req: Request, res: Response): Promise<boolean> {
  let auth = (req.header("Authorization") || "").trim();

  if (auth.toLowerCase().indexOf("bearer ") != 0) {
    res.status(403).end(JSON.stringify({
      result: 'error',
      error: 'forbidden',
      message: 'Missing Bearer header.'
    }));
    return false;
  }

  let oauthToken = auth.substr("bearer ".length);
  let matchedUser = await getMemberWithToken(oauthToken, ['role', 'enterprise_id']);

  if (!matchedUser || !("role" in matchedUser)) {
    res.status(403).end(JSON.stringify({
      result: 'error',
      error: 'forbidden',
      message: 'Invalid token or without role.'
    }));
    return false;
  }

  if (role == "admin") {
    if (matchedUser.role != "admin") {
      res.status(403).end(JSON.stringify({
        result: 'error',
        error: 'forbidden',
        message: 'Admin permission required.'
      }));
      return false;
    }
    return true;
  }

  if (role == "member") {
    let publicEnterpriseId = req.param("enterpriseId", "");
    let enterpriseId = await query(
      "SELECT id FROM enterprise WHERE public_id = ? LIMIT 1",
      [publicEnterpriseId],
      {
        forceArray: false,
        skipObjectIfSingleResult: true
      }
    );

    console.log("enterprise id: ", enterpriseId, typeof enterpriseId, "matched user enterprise id: ", matchedUser.enterprise_id, typeof matchedUser.enterprise_id)

    if (matchedUser.enterprise_id != enterpriseId) {
      res.status(403).end(JSON.stringify({
        result: 'error',
        error: 'forbidden',
        message: 'Denied from the enterprise with ID: ' + publicEnterpriseId + '.'
      }));
      return false;
    }
  }

  return true;
}

async function getMemberWithToken(token: string, columns: string[]): Promise<any> {
  return query(
    `SELECT ${columns.join(",")} FROM user WHERE auth_token = ?`,
    [token]
  );
}