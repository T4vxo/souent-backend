import { Request } from "express";

/**
 * Represents a request with an optionally authorized user.
 * @author Johan Svensson
 */
export default interface AuthRequest extends Request {
  user?: { id: any }
}