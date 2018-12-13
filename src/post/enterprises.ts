import { Request, Response } from "express";
import utils from "../utils";
import { query } from "../db";
import uuid from 'uuid';
import { requireRoleWithResponse } from "../auth/role_auth";
import MemberData from "../models/MemberData";
import { baseUrl } from "../server_config";
import email from "../services/email";
import { getMemberIdByEmail } from "../auth/users";

/**
 * Creates a new enterprise.
 * @author Johan Svensson
 */
export default async (req: Request, res: Response) => {
  if (!await requireRoleWithResponse('contributor', req, res)) {
    return;
  }

  console.log("body: ", req.body, "additionalMembers" in req.body);

  if (!utils.assertParamsWithResponse([
    'name',
    'businessIdea',
    'additionalMembers',
  ], req.body, res)) {
    return;
  }

  let { body } = req;
  let name: string = body.name;
  let businessIdea: string = body.businessIdea;
  let additionalMembers: MemberData[] = (body.additionalMembers as string[]).map(email => {
    return {
      email
    }
  });

  if (!Array.isArray(additionalMembers)) {
    return res.status(400).end(JSON.stringify({
      result: 'error',
      error: 'validation',
      message: 'additionalMembers must be an array of type MemberData'
    }))
  }

  let logoUri: string = 'i am logo boi';

  let validationError = validate(name, businessIdea);
  if (validationError !== true) {
    return res.status(400).end(JSON.stringify({
      result: 'error',
      error: 'validation',
      message: validationError
    }))
  }

  let publicId = await generateUniquePublicId();

  let insert = await query(
    `INSERT INTO enterprise (name, description, logo, public_id) VALUES (?, ?, ?, ?)`,
    [name, businessIdea, logoUri, publicId]
  ) as any;

  let enterpriseId = insert.insertId;

  if (additionalMembers.length) {
    await addMembers(additionalMembers, enterpriseId);
    await notifyMembers(additionalMembers, {
      name,
      publicId
    });
  }

  await insertBMCCards(enterpriseId);

  //  OK
  res.end(JSON.stringify({
    result: 'ok',
    enterprise: {
      id: enterpriseId,
      publicId
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

async function generateUniquePublicId() {
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

  return publicId;
}

async function addMembers(members: MemberData[], enterpriseId: any) {
  for (let member of members) {
    let memberId = await getMemberIdByEmail(member.email);

    //  Update enterprise ID
    await query(
      `UPDATE user SET enterprise_id = ? WHERE id = ?`,
      [enterpriseId, memberId]
    );
  }
}

async function notifyMembers(members: MemberData[], enterpriseData: { name: string, publicId: string }) {
  console.log("[notifyMembers] ", members)
  let bmcLink = `${baseUrl}/bmc/${enterpriseData.publicId}`;

  let subject = `Medlem i ${enterpriseData.name}`;
  let htmlMessage = (
    `Hej!<br/><br/>` +
    `Du har lagts till som medlem i företaget "${enterpriseData.name}". ` +
    `Kolla in och redigera företagets <a href="${bmcLink}">business model canvas (BMC) här</a>.<br/><br/>` +
    `Fungerar inte länken? Det går bra att gå in här: ${bmcLink}`
  );

  for (let member of members) {
    //  Don't use await as this can fail
    email(member.email, subject, htmlMessage)
  }
}

/**
 * Inserts default, empty cards for a specific enterprise.
 * @param enterpriseId 
 */
async function insertBMCCards(enterpriseId: any) {
  let cardCount = parseInt(await query(
    `SELECT MAX(id) FROM card_name`,
    null,
    {
      forceArray: false,
      skipObjectIfSingleResult: true
    }
  ) as any);

  let insertGroups: string[] = [];
  for (let i = 0; i < cardCount; i++) {
    insertGroups.push(`(${i + 1}, ?)`);
  }

  await query(
    `INSERT INTO card (name_id, enterprise_id) VALUES ` +
    insertGroups.join(","),
    insertGroups.map(() => enterpriseId)
  );
}