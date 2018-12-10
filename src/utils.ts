import { Response } from "express";

function assertParams(props: string[], obj: any) {
  let missingProps = [];

  for (let i of props) {
    console.log(`${i} in obj: `, (i in obj));
    if (!(i in obj)) {
      missingProps.push(i);
    }
  }
  console.log("assertParams", props, obj, missingProps);

  if (missingProps.length > 0) {
    throw new Error("Missing parameters: " + missingProps.join(","));
  }
}

/**
 * Some utilities.
 * @author Johan Svensson
 */
export default {
  /**
   * Checks if the object contains all properties defined in an array,
   * Throws an error if missing one or more properties.
   * @param props Required properties
   * @param obj Object to check
   * @param allowEmptyString Whether to allow an empty input
   */
  assertParams,

  /**
   * Assert that params exists, otherwise ends the request with an error response.
   * @returns Whether the validation passed.
   */
  assertParamsWithResponse: (props: string[], obj, res: Response) => {
    try {
      assertParams(props, obj);
      return true;
    } catch (e) {
      res.status(400).end(JSON.stringify({
        status: 'error',
        error: 'missingParams',
        message: (e as Error).message
      }))
      return false;
    }
  },

  
}