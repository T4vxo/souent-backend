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
  let cards = await query(
    `SELECT
        content AS contentHtml,
        name
      FROM bmc
        WHERE enterprise_public_id=?`,
    [params.enterpriseId],
    {
      forceArray: true,
      skipObjectIfSingleResult: false
    }
  ) as BMCCard[];

  res.json({
    bmc: cards
  });
}