import { Request, Response } from "express";
import { query } from "../db";
import { requireRoleWithResponse } from "../auth/role_auth";

/**
 * Revokes member access for an enterprise.
 * @author Johan Svensson
 */
export default async (req: Request, res: Response) => {
  if (!await requireRoleWithResponse('member', req, res)) {
    return;
  }
  
  let { params } = req;
  let { targetEmail } = params;

  let result = await query(
    `UPDATE users SET enterprise_id = NULL WHERE email = ?`,
    [ targetEmail ]
  );

  res.status(200).end(JSON.stringify({
    result: 'ok'
  }))
}