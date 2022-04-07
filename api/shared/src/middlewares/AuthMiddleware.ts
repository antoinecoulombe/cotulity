import { extractToken, parseJwt } from '../routes/Auth';

const db = require('../../db/models');

/**
 * Adds the user to the request based on the id found in the request bearer token.
 * @param req The HTTP request.
 * @returns A promise to return a boolean indicating if the user was added to the request.
 */
export const AddUserToRequest = async (req: any): Promise<boolean> => {
  try {
    let parsedToken = parseJwt(extractToken(req));

    // If token is invalid or user id is not a number
    if (!parsedToken || !parsedToken.id || isNaN(parsedToken.id))
      throw 'Invalid user id.';

    // Get user from  database
    let user = await db.User.findOne({ where: { id: parsedToken.id } });
    if (!user) throw 'User not found';

    req.user = user;
    return true;
  } catch (e) {
    req.user = null;
    return false;
  }
};
