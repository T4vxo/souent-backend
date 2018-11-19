import mysql from 'mysql';
import fs from 'fs';

let _db: mysql.Connection;

export const db = () => _db;

class QueryOptions {
  /**
   * Whether to force the output as an array.
   */
  forceArray?: boolean;

  /**
   * Whether to only output the result (if only one) instead of a whole object.
   */
  skipObjectIfSingleResult?: boolean;
}
/**
 * Performs a regular query with optional options.
 */
export const query = (sql: string, args?: any, opts?: QueryOptions) =>
  new Promise(async (resolve, reject) => {
    let result = _db.query(sql, Array.isArray(args) ? args : [args], (e, res: any[]) => {
      if (!opts) {
        opts = new QueryOptions();
        opts.forceArray = false;
        opts.skipObjectIfSingleResult = true;
      }

      if (e) {
        //  Error occurred
        return reject(e);
      }

      let output: any = res;

      if (Array.isArray(output)) {
        if (!opts.forceArray && res.length < 2) {
          output = res[0];
        }

        if (opts.skipObjectIfSingleResult) {
          output = res.map(e => {
            let keys = Object.keys(e);

            if (keys.length == 1) {
              return e[keys[0]];
            } else {
              return e;
            }
          });

          console.log("Output: ", output);

          if (output.length == 1) {
            output = output[0];
          }
        }
      }

      return resolve(output);
    });
  })
  
/**
 * Sets up the MySQL driver connection.
 */
export function setupDb() {
  return new Promise(async (resolve, reject) => {
    console.log("Setting up db...");
    _db = await mysql.createConnection(
      {
        ...JSON.parse(fs.readFileSync('/var/cred/souentcred').toString()),
        charset: "utf8_general_ci"
      }
    );

    _db.connect(e => {
      if (e) {
        console.error("Fatal DB error:", e);
        reject();
        return process.exit(1);
      }

      console.log("Connected to db!");
      return resolve(_db);
    });
  })
};