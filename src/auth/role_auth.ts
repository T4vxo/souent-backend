import { Response, Request } from "express";
import { query } from "../db";

export type Role = 'admin' | 'member' | 'contributor'
export type RequireRoleResponse = 'missingToken' | 'invalidToken' | 'deniedRole' | 'deniedEnterprise' | 'granted'

export async function requireRole(req: Request, role: Role, enterprisePublicId: string): Promise<RequireRoleResponse> {
  let auth = (req.header("Authorization") || "").trim();

  if (auth.toLowerCase().indexOf("bearer ") != 0) {
    return 'missingToken';
  }

  let authToken = auth.substr("bearer ".length);
  let matchedUser = await getMemberWithToken(authToken, ['role', 'enterprise_id']);

  if (!matchedUser || !("role" in matchedUser)) {
    return 'invalidToken';
  }

  if (role == "admin") {
    if (matchedUser.role != "admin") {
      return 'deniedRole'
    }
    return 'granted';
  }

  if (role == "member" || role =="contributor") {
    let enterpriseId = await query(
      "SELECT id FROM enterprise WHERE public_id = ? LIMIT 1",
      [enterprisePublicId],
      {
        forceArray: false,
        skipObjectIfSingleResult: true
      }
    );

    console.log("enterprise id: ", enterpriseId, typeof enterpriseId, "matched user enterprise id: ", matchedUser.enterprise_id, typeof matchedUser.enterprise_id)

    if (matchedUser.enterprise_id != enterpriseId) {
      return 'deniedEnterprise'
    }
  }

  return 'granted';
}

/**
 * Checks user role before handling a request. Ends the request with 403 FORBIDDEN if the required
 * role does not match that of the user's.
 * @param role Required role. "admin" for site administrators, "member" for any member of a social enterprise (where the public ID must be part of the path parameters as :enterpriseId), "contributor" for any signed-in user.
 * @returns Whether the validation succeeded.
 */
export async function requireRoleWithResponse(role: Role, req: Request, res: Response): Promise<boolean> {
  let { enterpriseId } = req.params;

  switch (await requireRole(req, role, enterpriseId)) {
    case 'missingToken':
      res.status(403).json({
        result: 'error',
        error: 'forbidden',
        message: 'Missing Bearer header.'
      });
      return false;
    case 'invalidToken':
      res.status(403).json({
        result: 'error',
        error: 'forbidden',
        message: 'Invalid token or without role.'
      });
      return false;

    case 'deniedRole':
      res.status(403).json({
        result: 'error',
        error: 'forbidden',
        message: 'Admin permission required.'
      });
      return false;

    case 'deniedEnterprise':
      res.status(403).json({
        result: 'error',
        error: 'forbidden',
        message: 'Denied from the enterprise with ID: ' + enterpriseId + '.'
      });
      return false;
  }

  return true;
}

async function getMemberWithToken(token: string, columns: string[]): Promise<any> {
  return query(
    `SELECT ${columns.join(",")} FROM user WHERE auth_token = ?`,
    [token]
  );
}