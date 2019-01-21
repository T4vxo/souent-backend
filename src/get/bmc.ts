import { Request } from "express";
import { Response } from "express-serve-static-core";
import Enterprise from "../models/Enterprise";
import { query } from "../db";
import BMCCard from "../models/BMCCard";

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
        content AS contentHtml,
        name AS title
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
      name
      FROM enterprise
        WHERE id = ?`,
    [enterpriseId],
    { forceArray: false, skipObjectIfSingleResult: false }
  ) as any || {};

  enterprise.id = enterpriseId

  res.json({
    enterprise,
    bmc: cards
  });
}