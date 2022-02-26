import { extractToken, parseJwt } from '../src/Auth';

const db = require('../db/models');

export const AddUser = async (req: any) => {
  let parsedToken = parseJwt(extractToken(req));
  req.user = await db.User.findOne({ where: { id: parsedToken.id } });
};
