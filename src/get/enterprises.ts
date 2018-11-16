import { Request } from "express";
import { Response } from "express-serve-static-core";
import Enterprise from "../models/Enterprise";
import { query } from "../db";

/**
 * Outputs all enterprises.
 * @author Johan Svensson
 */

export default async (req: Request, res: Response) => {
  let enterprises = await query(
    `SELECT * FROM enterprise`,
    null,
    {
      forceArray: true,
      skipObjectIfSingleResult: false
    }
  ) as Enterprise[];

  enterprises = enterprises.map(e => {
    e.id = parseInt(e.id as any);
    return e;
  });

  res.end(JSON.stringify({
    enterprises
  }));
}