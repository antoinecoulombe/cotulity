import { extractToken, parseJwt } from '../routes/Auth';

const db = require('../../db/models');

export const AddUserToRequest = async (req: any) => {
  let parsedToken = parseJwt(extractToken(req));
  if (!parsedToken) req.user = null;
  else req.user = await db.User.findOne({ where: { id: parsedToken.id } });
};
