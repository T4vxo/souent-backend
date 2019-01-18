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

  let targetEmail: string = req.body.email;

  let enterprisePublicId = req.params.enterpriseId;
  console.log("enterprisePublicId: ", enterprisePublicId);
  let enterpriseId = await query(
    `SELECT id FROM enterprise WHERE public_id = ? LIMIT 1`,
    [ enterprisePublicId ],
    {
      forceArray: false,
      skipObjectIfSingleResult: true
    }
  );

  if (!enterpriseId) {
    return res.status(401).json({
      result: 'error',
      error: 'invalidEnterprise'
    });
  }

  //  ID of enterprise of which this user already is in
  let existingEnterpriseId = await query(
    `SELECT enterprise_id FROM user WHERE email = ?`,
    [ targetEmail ]
  );

  if (existingEnterpriseId) {
    return res.status(403).json({
      result: 'error',
      error: 'alreadyInEnterprise',
      message: 'The user with the email ' + targetEmail + ' is already within an enterprise.'
    });
  }

  let result = await query(
    `UPDATE user SET enterprise_id = ? WHERE email = ?`,
    [ enterpriseId, targetEmail ]
  );

  res.status(201).json({
    result: 'ok'
  });
}