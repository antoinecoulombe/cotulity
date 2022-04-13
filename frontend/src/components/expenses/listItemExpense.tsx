import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  AccountHomeMember,
  Expense,
  getUserWithRecord,
} from '../../views/apps/accounts';
import ListItem from '../utils/lists/listItem';
import ListItemLeft from '../utils/lists/listLeft';
import ListItemRight from '../utils/lists/listRight';
import Translate from '../utils/translate';

interface ListItemExpenseProps {
  expense: Expense;
  users: AccountHomeMember[];
}

const ListItemExpense = (props: ListItemExpenseProps): JSX.Element => {
  const { t } = useTranslation('common');

  const getCompleteName = (user?: AccountHomeMember): string => {
    if (!user) return t('unknown');
    return user.firstname + ' ' + user.lastname;
  };

  const getExpenseUser = (e: Expense) => {
    return getUserWithRecord(props.users, e.paidByUserId);
  };

  return (
    <ListItem
      uid={props.expense.id}
      className="expense"
      onClick={[
        <h4 key={props.expense.id}>
          <Translate name="expenses.title.splittedWith" />:
        </h4>,
      ].concat(
        props.expense.ExpenseSplits.map((es) =>
          getUserWithRecord(props.users, es.userId)?.Image?.url ? (
            <img
              id="img-profile"
              key={es.userId}
              src={`http://localhost:4000/images/public/${
                getUserWithRecord(props.users, es.userId)?.Image?.url
              }`}
              alt={'NA'}
              title={getCompleteName(getUserWithRecord(props.users, es.userId))}
            />
          ) : (
            <FontAwesomeIcon
              key={es.userId}
              icon="user-circle"
              title={getCompleteName(getUserWithRecord(props.users, es.userId))}
            ></FontAwesomeIcon>
          )
        )
      )}
    >
      <ListItemLeft>
        <div className="img-text">
          {getExpenseUser(props.expense)?.Image?.url ? (
            <img
              id="img-profile"
              src={`http://localhost:4000/images/public/${
                getExpenseUser(props.expense)?.Image?.url
              }`}
              alt={'NA'}
              title={getCompleteName(
                getUserWithRecord(props.users, props.expense.paidByUserId)
              )}
            />
          ) : (
            <FontAwesomeIcon
              icon="user-circle"
              title={getCompleteName(
                getUserWithRecord(props.users, props.expense.paidByUserId)
              )}
            ></FontAwesomeIcon>
          )}
          <div className="expense-lil-text">
            <h3
              title={
                props.expense.description.length <= 22
                  ? undefined
                  : props.expense.description
              }
            >
              {props.expense.description.length >= 22
                ? props.expense.description.substring(0, 22) + '...'
                : props.expense.description}
            </h3>
            <h4>
              {
                <Translate
                  name={`{"translate":"expenses.date","format":["${t(
                    'date.month.' +
                      new Date(props.expense.date)
                        .toLocaleString('en-US', { month: 'short' })
                        .toLowerCase()
                  )}","${new Date(props.expense.date).getDate()}"]}`}
                />
              }
              <FontAwesomeIcon icon="circle"></FontAwesomeIcon>
              {t('expenses.by')}{' '}
              <b>
                {props.users.find(
                  (u) => u.UserRecord.id === props.expense.paidByUserId
                )?.firstname ?? t('unknown')}
              </b>
            </h4>
          </div>
        </div>
      </ListItemLeft>
      <ListItemRight>
        <h2>
          <Translate
            name={`{"translate":"dollar","format":["${props.expense.totalAmount}"]}`}
          />
        </h2>
      </ListItemRight>
    </ListItem>
  );
};

export default ListItemExpense;
