import * as Global from './Global';
import * as Translate from './Translate';

// Returns false if the connected user is not the home owner.
export const denyIfNotOwner = async (req: any, res: any): Promise<boolean> => {
  if (res.locals.home.ownerId !== req.user.id) {
    res
      .status(403)
      .json({ title: 'request.denied', msg: 'request.unauthorized' });
    return true;
  }
  return false;
};

// Retrieves the members from the current home, excluding the connected user.
export const getMembersExceptRequester = async (
  req: any,
  res: any
): Promise<number[]> => {
  return (await res.locals.home.getMembers())
    .filter((m: any) => m.id !== req.user.id)
    .map((m: any) => m.id);
};

// Retrieves the members from the current home, excluding the owner.
export const getMembersExceptOwner = async (home: any): Promise<number[]> => {
  return (await home.getMembers())
    .filter((m: any) => m.id !== home.ownerId)
    .map((m: any) => m.id);
};

export const notifyMembersExceptOwner = async (
  home: any,
  transaction: any
): Promise<void> => {
  // Send notifications to deleted users
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
