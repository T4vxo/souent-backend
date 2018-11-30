import { OAuth2Client } from "google-auth-library";


const CLIENT_ID = "1073625624905-14k2qlehtaio8g7k8cq60os56jr0n4hm.apps.googleusercontent.com"

const client = new OAuth2Client(CLIENT_ID)
/**
 * @author Daniel Grigore
 */
export async function verifyToken(token) {
    console.log("verifyRoken: ", token);

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        })
        const payload = ticket.getPayload();
        const userId = payload['sub']
        const userEmail = payload['email']

        return {
            userId,
            userEmail
        }
    } catch (error) {
        console.error(error)
        return null
    }




}

