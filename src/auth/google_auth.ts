import { OAuth2Client } from "google-auth-library";


const CLIENT_ID = "1073625624905-14k2qlehtaio8g7k8cq60os56jr0n4hm.apps.googleusercontent.com"
const CLIENT_SECRET = "QIik041v6C5VtmpD-mdMd3uc"

const client = new OAuth2Client(CLIENT_ID)
/**
 * @author Daniel Grigore
 */
export async function verifyToken(token) {
  console.log("verifyToken: ", token);

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    })
    const payload = ticket.getPayload();
    const userEmail = payload['email']

    console.log("veryifyToken payload: ", payload);

    return {
      userEmail
    }
  } catch (error) {
    console.error(error)
    return null
  }

}

