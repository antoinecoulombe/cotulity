import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  AccountHomeMember,
  getDateString,
  getUserWithRecord,
  Transfer,
} from '../../views/apps/accounts';
import ListItem from '../utils/lists/listItem';
import ListItemLeft from '../utils/lists/listLeft';
import ListItemCenter from '../utils/lists/listItemCenter';
import ListItemRight from '../utils/lists/listRight';
import Translate from '../utils/translate';

interface ListItemTransferProps {
  transfer: Transfer;
  users: AccountHomeMember[];
}

const ListItemTransfer = (props: ListItemTransferProps): JSX.Element => {
  const { t } = useTranslation('common');

  const getCompleteName = (user?: AccountHomeMember): string => {
    if (!user) return t('unknown');
    return user.firstname + ' ' + user.lastname;
  };

  const getToUser = () =>
    getUserWithRecord(props.users, props.transfer.toUserId);
  const getFromUser = () =>
    getUserWithRecord(props.users, props.transfer.fromUserId);

  return (
    <ListItem
      uid={props.transfer.id}
      className="transfer"
      onClick={[
        <h4 className="with-accent" key={props.transfer.id}>
          <b>{getFromUser()?.firstname ?? t('unknown')}</b>{' '}
          <Translate name="transfers.sent" />{' '}
          <b>
            <Translate
              name={`{"translate":"dollar","format":["${props.transfer.amount}"]}`}
            />
          </b>{' '}
          <Translate name="transfers.to" />{' '}
          <b>{getToUser()?.firstname ?? t('unknown')}</b>{' '}
          <Translate name="transfers.on" />{' '}
          {getDateString(props.transfer.date, t)}
          <Translate name="transfers.dot" />
        </h4>,
      ]}
    >
      <ListItemLeft>
        <div className="img-text">
          {getFromUser()?.Image?.url ? (
            <img
              id="img-profile"
              src={`http://localhost:4000/images/public/${
                getFromUser()?.Image?.url
              }`}
              alt={'NA'}
              title={getCompleteName(getFromUser())}
            />
          ) : (
            <FontAwesomeIcon
              icon="user-circle"
              title={getCompleteName(getFromUser())}
            ></FontAwesomeIcon>
          )}
          <div className="expense-lil-text">
            <h4 className="name">{getFromUser()?.firstname ?? t('unknown')}</h4>
            <h4>
              <Translate name="transfers.sent" />
            </h4>
          </div>
        </div>
      </ListItemLeft>
      <ListItemCenter>
        <div>
          <h2>
            <b>
              <Translate
                name={`{"translate":"dollar","format":["${props.transfer.amount}"]}`}
              />
            </b>
          </h2>
          <h4>{getDateString(props.transfer.date, t)}</h4>
        </div>
      </ListItemCenter>
      <ListItemRight>
        <div className="img-text">
          {getToUser()?.Image?.url ? (
            <img
              id="img-profile"
              src={`http://localhost:4000/images/public/${
                getToUser()?.Image?.url
              }`}
              alt={'NA'}
              title={getCompleteName(getToUser())}
            />
          ) : (
            <FontAwesomeIcon
              icon="user-circle"
              title={getCompleteName(getToUser())}
            ></FontAwesomeIcon>
          )}
          <div className="expense-lil-text">
            <h4>
              <Translate name="transfers.to" />
            </h4>
            <h4 className="name">{getToUser()?.firstname ?? t('unknown')}</h4>
          </div>
        </div>
      </ListItemRight>
    </ListItem>
  );
};

export default ListItemTransfer;
