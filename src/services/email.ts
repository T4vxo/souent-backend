import fs from 'fs';
import os from 'os';
import nodemailer from 'nodemailer';
import { Attachment } from 'nodemailer/lib/mailer';

export const devRecipient = 'jojjedeveloper@gmail.com';
export const prodRecipient = 'lumendevelopment@gmail.com';

export const authPath = os.platform() == "win32" ? "C:\\cred\\seappcred" : "/var/cred/seappcred";

/**
 * Sends a mail to a recipient.
 */
export default async (to: string | string[], subject: string, message: string,
  cc: string = undefined, attachments: Attachment[] = undefined) => {
  let auth;
  try {
    auth = JSON.parse(fs.readFileSync(authPath, 'utf8'));
  } catch (e) {
    console.log("FATAL ERROR: Mail credentials not found! At " + authPath, e);
    throw e;
  }

  let ccArray: string[];
  if (typeof cc == "string") {
    ccArray = [cc];
  } else if (Array.isArray(cc)) {
    ccArray = cc;
  }

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth
  });
  try {
    let user: string = auth.user;
    let username = user.substr(0, user.indexOf('@'));

    message = injectSignature(message, username);

    console.log("Email settings", {
      from: auth.user,
      to,
      subject,
      html: message,
      attachments,
      cc: ccArray
    })

    await transporter.sendMail({
      from: auth.user,
      to,
      subject,
      html: message,
      attachments,
      cc: ccArray
    });
  } catch (e) {
    console.log("FATAL ERROR: Could not send request mail!", e);
    throw e;
  }
}

/**
 * Attempts to read a signature text file for a user. Does not inject anything
 * if the file does not exist.
 * @param user File to match in a default location.
 */
function injectSignature(original: string, user: string): string {
  const containsHtml = /<\w+>/.test(original);
  let path = `/var/signatures/${user}`;
  let htmlLikePath = `${path}_html`;

  if (containsHtml && fs.existsSync(htmlLikePath)) {
    path = htmlLikePath;
  }

  try {
    let signature = fs.readFileSync(path, 'utf8');
    if (!signature) {
      return original;
    }

    if (containsHtml) {
      signature = `<br/><br/><br/>${signature.trim()}`;
    } else {
      signature = `\n\n\n${signature.trim()}`;
    }

    return `${original}${signature}`;
  } catch (e) {
    return original;
  }
}