import { Request, Response } from "express";
import { query } from "../db";

let updateableColumns = [
  
]

/**
 * Updates an existing business model canvas card.
 * @author Johan Svensson
 */
export default async (req: Request, res: Response) => {
  let { params } = req;

  let enterpriseId: string = params.enterpriseId;

  let result = await query(
    `UPDATE card SET content="why why"
      WHERE card.enterprise_id = (
          SELECT id FROM enterprise WHERE public_id = ?
      )`,
    [enterpriseId]
  ) as any;

  console.log("Result: ", result);

  if (result.affectedRows == 0) {
    return res.end(JSON.stringify({
      result: 'noChange'
    }))
  }

  return res.end(JSON.stringify({
    result: 'ok'
  }))
}