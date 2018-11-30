import { Request, Response } from "express";
import utils from "../utils";
import { verifyToken } from "../auth/google_auth";
import { query } from "../db";

/**
 * @author Daniel Grigore
 */
export default async function (req: Request, res: Response) {
    //console.log("bodfy:", req);
    
    if (!utils.assertParamsWithResponse([
        'token'
    ],req.body,res)) {
        return;
    }

    let { token } = req.body;

    let user = await verifyToken(token);
    if (user == null) {
        
        return res.status(400).end(JSON.stringify({result: "error", error: 'user cannot be null'}))
    }
    await query("INSERT INTO user (email, secret) VALUES (?, ?)", [user.userEmail,user.userId])

    res.end(JSON.stringify({
        message_token: 'token ' + req.body.token,
    }))

}