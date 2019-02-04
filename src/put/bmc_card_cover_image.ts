import AuthRequest from "../models/AuthRequest";
import { Response } from "express";
import utils from "../utils";
import { query } from "../db";
import { requireRoleWithResponse } from "../auth/role_auth";

/**
 * Uploads and replaces a card's cover image.
 */
export default async function (req: AuthRequest, res: Response) {
  if (!await requireRoleWithResponse('member', req, res)) {
    return;
  }

  let { params, body, file } = req;

  let enterpriseId: string = params.enterpriseId;
  let cardId: string = params.cardId;
  let enterpriseNumericId = await query(
    `SELECT id FROM enterprise WHERE public_id = ?`,
    [enterpriseId],
    {
      forceArray: false,
      skipObjectIfSingleResult: true
    }
  )

  if (!enterpriseNumericId) {
    //  Should've checked with requireRoleWithResponse
    return res.status(500);
  }
}