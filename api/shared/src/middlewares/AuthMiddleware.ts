import { extractToken, parseJwt } from '../routes/Auth';

const db = require('../../db/models');

export const AddUserToRequest = async (req: any): Promise<boolean> => {
  try {
    let parsedToken = parseJwt(extractToken(req));
    if (!parsedToken) {
      req.user = null;
      return false;
    }

    req.user = await db.User.findOne({ where: { id: parsedToken.id } });
    return true;
  } catch (e) {
    return false;
  }
};
