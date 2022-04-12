import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AccountHomeMember, Debt } from '../../views/apps/accounts';
import ListItem from '../utils/lists/listItem';
import ListItemLeft from '../utils/lists/listLeft';
import ListItemRight from '../utils/lists/listRight';
import Translate from '../utils/translate';

interface CompoundDebtListItemProps {
  debts: Debt[];
  users: AccountHomeMember[];
}

const CompoundDebts = (props: CompoundDebtListItemProps): JSX.Element => {
  const { t } = useTranslation('common');

  const [cDebts, setCDebts] = useState<any[]>([]);

  useEffect(() => {}, []);

  const getUserWithRecord = (record: number) => {
    return props.users.find((u) => u.UserRecord.id === record);
  };

  const getCompleteName = (user?: AccountHomeMember): string => {
    if (!user) return t('unknown');
    return user.firstname + ' ' + user.lastname;
  };

  return cDebts.length ? (
    <>
      {cDebts.map((cd) => (
        <ListItem key={`cd-${cd.id}`} uid={cd.id} className="debt">
          <ListItemLeft>
            <div className="img-text">
              {getUserWithRecord(cd.fromUserId)?.Image?.url ? (
                <img
                  id="img-profile"
                  src={`http://localhost:4000/images/public/${
                    getUserWithRecord(cd.fromUserId)?.Image?.url
                  }`}
                  alt={'NA'}
                  title={getCompleteName(getUserWithRecord(cd.fromUserId))}
                />
              ) : (
                <FontAwesomeIcon
                  icon="user-circle"
                  title={getCompleteName(getUserWithRecord(cd.fromUserId))}
                ></FontAwesomeIcon>
              )}
              <div className="expense-lil-text">
                <h4>
                  <b>
                    {getUserWithRecord(cd.fromUserId)?.firstname ??
                      t('unknown')}
                  </b>{' '}
                  <Translate name="accounts.owes" />
                </h4>
              </div>
            </div>
          </ListItemLeft>
          <ListItemRight>
            <h2>
              <Translate
                name={`{"translate":"dollar","format":["${cd.amount}"]}`}
              />
            </h2>
          </ListItemRight>
          <ListItemRight>
            <div className="img-text">
              {getUserWithRecord(cd.toUserId)?.Image?.url ? (
                <img
                  id="img-profile"
                  src={`http://localhost:4000/images/public/${
                    getUserWithRecord(cd.toUserId)?.Image?.url
                  }`}
                  alt={'NA'}
                  title={getCompleteName(getUserWithRecord(cd.toUserId))}
                />
              ) : (
                <FontAwesomeIcon
                  icon="user-circle"
                  title={getCompleteName(getUserWithRecord(cd.toUserId))}
                ></FontAwesomeIcon>
              )}
              <div className="expense-lil-text">
                <h4>
                  <Translate name="transfers.to" />{' '}
                  <b>{getUserWithRecord(cd.toUserId) ?? t('unknown')}</b>
                </h4>
              </div>
            </div>
          </ListItemRight>
        </ListItem>
      ))}
    </>
  ) : (
    <h2>
      <Translate name={'noDebts'} prefix="accounts." />
    </h2>
  );
};

export default CompoundDebts;
