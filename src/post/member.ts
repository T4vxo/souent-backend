import { Request, Response } from "express";
import utils from "../utils";
import { query } from "../db";
import { requireRoleWithResponse } from "../auth/role_auth";

/**
 * Adds a member to the enterprise.
 * @author Johan Svensson
 */
export default async (req: Request, res: Response) => {
  if (!await requireRoleWithResponse('member', req, res)) {
    return;
  }
  
  if (!utils.assertParamsWithResponse([
    'email',
  ], req.body, res)) {
    return;
  }

  let enterprisePublicId = req.params.enterpriseId;
  let enterpriseId = await query(
    `SELECT id FROM enterprise WHERE public_id = ? LIMIT 1`,
    [ enterprisePublicId ],
    {
      forceArray: false,
      skipObjectIfSingleResult: true
    }
  );

  if (!enterpriseId) {
    return res.status(401).end(JSON.stringify({
      result: 'error',
      error: 'invalidEnterprise'
    }));
  }

  let result = await query(
    `UPDATE users SET enterprise_id = ? WHERE email = ?`
  );
}