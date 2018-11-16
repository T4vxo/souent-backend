import { Request, Response } from "express";
import utils from "../utils";

/**
 * Creates a new enterprise.
 * @author Johan Svensson
 */
export default async (req: Request, res: Response) => {
  if (!utils.assertParamsWithResponse([
    'name',
  ], req.body, res)) {
    return;
  }
}