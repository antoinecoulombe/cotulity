import * as Global from './Global';
import * as Translate from './Translate';

/**
 * Sends a 403 response if the connected user is not the home owner.
 * @param req The HTTP request.
 * @param res The HTTP response.
 * @returns If the connected user is not the home owner, true. Otherwise, false.
 */
export const denyIfNotOwner = async (req: any, res: any): Promise<boolean> => {
  try {
    if (!res.locals.home?.ownerId || !req.user?.id) throw 'Invalid users.';

    if (res.locals.home.ownerId !== req.user.id) {
      res
        .status(403)
        .json({ title: 'request.denied', msg: 'request.unauthorized' });
      return true;
    }
  } catch (error) {}
  return false;
};

/**
 * Retrieves the members from the current home, excluding the connected user.
 * @param req The HTTP request.
 * @param res The HTTP response.
 * @returns A promise to return an array containing the user ids of all home members, except the connected user id.
 */
export const getMembersExceptRequester = async (
  req: any,
  res: any
): Promise<number[]> => {
  try {
    if (!res.locals.home) throw 'Invalid home.';
    if (!req.user?.id) throw 'Invalid user.';

    return (await res.locals.home.getMembers())
      .filter((m: any) => m.id !== req.user.id)
      .map((m: any) => m.id);
  } catch (error) {
    return [];
  }
};

/**
 * Retrieves the members from the current home, excluding the owner.
 * @param home A sequelize home object.
 * @returns A promise to return an array containing the user ids of all home members, except the owner id.
 */
export const getMembersExceptOwner = async (home: any): Promise<number[]> => {
  try {
    if (!home || !home.ownerId) throw 'Invalid home.';

    return (await home.getMembers())
      .filter((m: any) => m.id !== home.ownerId)
      .map((m: any) => m.id);
  } catch (error) {
    return [];
  }
};

/**
 * Sends notifications to all home members except the owner.
 * @param home A sequelize home object.
 * @param transaction A sequelize transaction object.
 */
export const notifyMembersExceptOwner = async (
  home: any,
  transaction: any
): Promise<void> => {
  await Global.sendNotifications(
    await getMembersExceptOwner(home),
    {
      typeId: 3,
      title: Translate.getJSON('homes.excludedByOwner', [home.name]),
      description: Translate.getJSON('homes.homeDeletedByOwner', [home.name]),
    },
    transaction
  );
};

/**
 * Gets the current home users.
 * @param res The HTTP response.
 * @returns An array containing the home users.
 */
export const getHomeUsers = async (
  db: any,
  res: any
): Promise<
  {
    id: number;
    firstname: string;
    lastname: string;
    Image: { url: string } | null;
    UserRecord: { id: number };
  }[]
> => {
  return await res.locals.home.getMembers({
    attributes: ['id', 'firstname', 'lastname'],
    include: [
      { model: db.Image, attributes: ['url'] },
      { model: db.UserRecord, attributes: ['id'] },
    ],
    through: {
      where: { accepted: true },
      attributes: ['accepted', 'nickname'],
    },
  });
};
