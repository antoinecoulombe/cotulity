import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AccountHomeMember, Debt } from '../../views/apps/accounts';
import { useNotifications } from '../../contexts/NotificationsContext';
import axios from '../../utils/fetchClient';
import ListItem from '../utils/lists/listItem';
import ListItemLeft from '../utils/lists/listLeft';
import ListItemRight from '../utils/lists/listRight';
import Translate from '../utils/translate';
import ListItemCenter from '../utils/lists/listItemCenter';

interface CompoundDebtListItemProps {
  users: AccountHomeMember[];
}

const CompoundDebts = (props: CompoundDebtListItemProps): JSX.Element => {
  const { t } = useTranslation('common');
  const { setNotification } = useNotifications();

  const [cDebts, setCDebts] = useState<Debt[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    axios
      .get(`/accounts/${localStorage.getItem('currentHome')}/debts/compound`)
      .then(async (res: any) => {
        setCDebts(res.data.debts);
        setLoaded(true);
      })
      .catch((err) => {
        if (err?.response?.data) setNotification(err.response.data);
      });
  }, []);

  const getUserWithRecord = (record: number) => {
    return props.users.find((u) => u.UserRecord.id === record);
  };

  const getCompleteName = (user?: AccountHomeMember): string => {
    if (!user) return t('unknown');
    return user.firstname + ' ' + user.lastname;
  };

  return loaded ? (
    cDebts.length ? (
      <>
        {cDebts.map((cd) => (
          <ListItem
            key={`cd-from-${cd.fromUserId}-to-${cd.toUserId}`}
            className="debt"
          >
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
            <ListItemCenter>
              <div>
                <h2>
                  <b>
                    <Translate
                      name={`{"translate":"dollar","format":["${cd.amount}"]}`}
                    />
                  </b>
                </h2>
              </div>
            </ListItemCenter>
            <ListItemRight>
              <div className="img-text">
                <div className="expense-lil-text">
                  <h4>
                    <Translate name="transfers.to" />{' '}
                    <b>
                      {getUserWithRecord(cd.toUserId)?.firstname ??
                        t('unknown')}
                    </b>
                  </h4>
                </div>
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
              </div>
            </ListItemRight>
          </ListItem>
        ))}
      </>
    ) : (
      <h2>
        <Translate name={'noDebts'} prefix="accounts." />
      </h2>
    )
  ) : (
    <></>
  );
};

export default CompoundDebts;
