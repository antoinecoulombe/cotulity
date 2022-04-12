import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AccountHomeMember, Debt } from '../../views/apps/accounts';
import ListItem from '../utils/lists/listItem';
import ListItemLeft from '../utils/lists/listLeft';
import ListItemRight from '../utils/lists/listRight';
import Translate from '../utils/translate';

interface DebtListItemProps {
  debts: Debt[];
  users: AccountHomeMember[];
  fromUser: AccountHomeMember;
}

const ListItemDebt = (props: DebtListItemProps): JSX.Element => {
  const { t } = useTranslation('common');
  let totalOwed = 0;
  props.debts.forEach((v) => (totalOwed += v.amount));

  const getUserWithRecord = (record: number) => {
    return props.users.find((u) => u.UserRecord.id === record);
  };

  const getCompleteName = (user?: AccountHomeMember): string => {
    if (!user) return t('unknown');
    return user.firstname + ' ' + user.lastname;
  };

  return (
    <ListItem
      uid={props.fromUser.id}
      className="debt"
      onClick={props.debts.map((v) => (
        <div className="debt-row" key={`from-${v.fromUserId}-to-${v.toUserId}`}>
          <div className="left">
            {getUserWithRecord(v.toUserId)?.Image?.url ? (
              <img
                id="img-profile"
                src={`http://localhost:4000/images/public/${
                  getUserWithRecord(v.toUserId)?.Image?.url
                }`}
                alt={'NA'}
                title={getCompleteName(getUserWithRecord(v.toUserId))}
              />
            ) : (
              <FontAwesomeIcon
                icon="user-circle"
                title={getCompleteName(getUserWithRecord(v.toUserId))}
              ></FontAwesomeIcon>
            )}
            <h4>
              <Translate name="transfers.to" />{' '}
              <b>{getUserWithRecord(v.toUserId)?.firstname ?? t('unknown')}</b>
            </h4>
          </div>
          <div className="right">
            <h3>
              <b>
                <Translate
                  name={`{"translate":"dollar","format":["${v.amount}"]}`}
                />
              </b>
            </h3>
          </div>
        </div>
      ))}
    >
      <ListItemLeft>
        <div className="img-text">
          {props.fromUser?.Image?.url ? (
            <img
              id="img-profile"
              src={`http://localhost:4000/images/public/${props.fromUser?.Image?.url}`}
              alt={'NA'}
              title={getCompleteName(props.fromUser)}
            />
          ) : (
            <FontAwesomeIcon
              icon="user-circle"
              title={getCompleteName(props.fromUser)}
            ></FontAwesomeIcon>
          )}
          <div className="expense-lil-text">
            <h4>
              <b>{getCompleteName(props.fromUser)}</b>{' '}
              <Translate name="accounts.owes" />
            </h4>
          </div>
        </div>
      </ListItemLeft>
      <ListItemRight>
        <h2>
          <Translate
            name={`{"translate":"dollar","format":["${totalOwed}"]}`}
          />
        </h2>
      </ListItemRight>
    </ListItem>
  );
};

export default ListItemDebt;
