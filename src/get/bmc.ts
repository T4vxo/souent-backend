import { Request } from "express";
import { Response } from "express-serve-static-core";
import Enterprise from "../models/Enterprise";
import { query } from "../db";
import BMCCard from "../models/BMCCard";
import { mediaBaseUrl } from "../server_config";
import { requireRole } from "../auth/role_auth";

/**
 * Outputs business model canvas data for an enterprise.
 * @author Johan Svensson
 */

export default async (req: Request, res: Response) => {
  let { params } = req;
  let { enterpriseId } = params;
  let cards = await query(
    `SELECT
        card_id AS id,
        content AS htmlContent,
        content AS htmlPreviewContent,
        name AS title,
        last_edit AS lastEdit,
        CONCAT('${mediaBaseUrl}/', image_uri) AS imageSrc
      FROM bmc
        WHERE enterprise_public_id=?`,
    [params.enterpriseId],
    {
      forceArray: true,
      skipObjectIfSingleResult: false
    }
  ) as BMCCard[];

  let enterprise = await query(
    `SELECT
      name,
      description AS businessIdea,
      CONCAT('${mediaBaseUrl}/', logo) AS logoUrl
      FROM enterprise
        WHERE public_id = ?`,
    [enterpriseId],
    { forceArray: false, skipObjectIfSingleResult: false }
  ) as any || {};

  enterprise.id = enterpriseId

  let members = await query(
    `SELECT user.email FROM user
      JOIN enterprise ON enterprise.public_id = ?
      WHERE enterprise_id = enterprise.id`,
    [enterpriseId],
    {
      forceArray: true,
      skipObjectIfSingleResult: false
    }
  )

  let permissions = await requireRole(req, 'contributor', enterpriseId)

  res.json({
    enterprise,
    bmc: cards,
    members,
    editable: permissions == 'granted'
  });
}