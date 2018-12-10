import { query } from "../db";

export async function token() {
  let text = ""
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  for (let i = 0; i < 1024; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))    
  }  

  if (await checkUnique(text)) {
    return await token()
  } 
  return text    
}

/**
 * @returns Whether there is an existing token in the database.
 */
export async function checkUnique(token) {
    return (await query("SELECT '1' FROM user WHERE auth_token = ?", [token], { forceArray: true }) as any[]).length == 0;
}
