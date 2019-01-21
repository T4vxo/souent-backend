import { Request } from "express";
import { Response } from "express-serve-static-core";
import Enterprise from "../models/Enterprise";
import { query } from "../db";
import { mediaBaseUrl } from "../server_config";

/**
 * Outputs all enterprises.
 * @author Johan Svensson
 */

export default async (req: Request, res: Response) => {
  let enterprises = await query(
    `SELECT
      name,
      description AS businessIdea,
      public_id AS id,
      CONCAT('${mediaBaseUrl}/', logo) AS logoUrl
      FROM enterprise`,
    null,
    {
      forceArray: true,
      skipObjectIfSingleResult: false
    }
  ) as Enterprise[];

  res.json({
    enterprises
  });
}