import { Request, Response } from "express";
import { query } from "../db";
import { requireRoleWithResponse } from "../auth/role_auth";
import sanitizeHTML from 'sanitize-html';

let updateableColumns = [
  'content'
];

//  Allowed HTML tags in the card content
let allowedContentTags = [
  'a', 'img', 'p', 'h2', 'em', 'u', 'strong'
];

/**
 * Updates an existing business model canvas card.
 * @author Johan Svensson
 */
export default async (req: Request, res: Response) => {
  if (!await requireRoleWithResponse('member', req, res)) {
    return;
  }

  let { params, body } = req;

  //  Columns to update in this request
  let columnsToUpdate = {};

  for (let col of updateableColumns) {
    if (col in body) {
      columnsToUpdate[col] = body[col];
    }

    if (col == "content") {
      //  Sanitize content
      columnsToUpdate[col] = sanitizeHTML(columnsToUpdate[col], {
        allowedTags: allowedContentTags,
        allowedAttributes: {
          'a': ['href']
        },
        allowedIframeHostnames: ['www.youtube.com']
      })
    }
  }
  let columnsToUpdateKeys = Object.keys(columnsToUpdate);
  if (!columnsToUpdateKeys.length) {
    return res.status(200).json({
      result: 'noUpdate'
    });
  }

  let enterpriseId: string = params.enterpriseId;
  let cardId: string = params.cardId;

  console.log("SQL: ", `UPDATE card SET
  ${columnsToUpdateKeys.map(col => `${col} = ?`).join(',')}
  JOIN enterprise ON enterprise.id = card.enterprise_id
  WHERE card.id = ? AND enterprise.public_id = ?`, 'with values:', [
      ...(columnsToUpdateKeys.map(col => columnsToUpdate[col])),
      cardId,
      enterpriseId
    ])

  let result: any;
  let enterpriseNumericId = await query(
    `SELECT id FROM enterprise WHERE public_id = ?`,
    [enterpriseId],
    {
      forceArray: false,
      skipObjectIfSingleResult: true
    }
  )

  if (enterpriseNumericId) {

    result = await query(
      `UPDATE card SET
        ${columnsToUpdateKeys.map(col => `${col} = ?`).join(',')}
        WHERE card.id = ? AND card.enterprise_id = ?`,
      [
        ...(columnsToUpdateKeys.map(col => columnsToUpdate[col])),
        cardId,
        enterpriseNumericId
      ]
    ) as any;

  } else {
    //  Simulate a no-update
    result = {
      affectedRows: 0
    }
  }

  console.log("Result: ", result);

  if (result.affectedRows == 0) {
    return res.json({
      result: 'noChange'
    });
  }

  return res.json({
    result: 'ok'
  });
}