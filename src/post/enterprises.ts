import { Request, Response } from "express";
import utils from "../utils";
import { query } from "../db";
import uuid from 'uuid';
import { requireRoleWithResponse } from "../auth/role_auth";

/**
 * Creates a new enterprise.
 * @author Johan Svensson
 */
export default async (req: Request, res: Response) => {
  if (!await requireRoleWithResponse('contributor', req, res)) {
    return;
  }
  
  if (!utils.assertParamsWithResponse([
    'name',
  ], req.body, res)) {
    return;
  }

  let { body } = req;
  let name: string = body.name;
  let about: string = body.about;

  let logoUri: string = 'i am logo boi';

  let validationError = validate(name, about);
  if (validationError !== true) {
    return res.status(401).end(JSON.stringify({
      result: 'error',
      error: 'validation',
      message: validationError
    }))
  }

  let publicId: string;

  do {
    publicId = uuid().substr(0, 36);
  } while (
    (await query(
      "SELECT '1' FROM enterprise WHERE public_id = ?",
      [publicId],
      { forceArray: true }
    ) as any[]).length > 0
  );

  let insert = await query(
    `INSERT INTO enterprise (name, description, logo, public_id) VALUES (?, ?, ?, ?)`,
    [name, about, logoUri, publicId]
  ) as any;

  //  OK
  res.end(JSON.stringify({
    result: 'ok',
    enterprise: {
      id: insert.insertId
    }
  }))
}

/**
 * Validates an enterprise name.
 * @returns Validation error or true if passed.
 */
function validate(name: string, description: string): string | true {
  if (!/(\w+){3,}/.test(name)) {
    return "invalidName";
  }

  return true;
}