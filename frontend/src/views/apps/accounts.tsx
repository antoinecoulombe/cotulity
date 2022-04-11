import { useEffect, useState } from 'react';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useTranslation } from 'react-i18next';
import { SidebarTab, SidebarModule } from '../../components/app/sidebar';
import { SubHeaderTab } from '../../components/app/subHeader';
import { default as ExpenseEditPopup } from '../../components/expenses/editPopup';
import { default as TransferEditPopup } from '../../components/transfers/editPopup';
import { HomeMember } from './homes';
import { getTranslateJSON } from '../../utils/global';
import AppContainer from '../../components/app/appContainer';
import List from '../../components/utils/lists/list';
import ListItem from '../../components/utils/lists/listItem';
import ListItemLeft from '../../components/utils/lists/listLeft';
import ListItemRight from '../../components/utils/lists/listRight';
import IconToolTip from '../../components/global/iconTooltip';
import axios from '../../utils/fetchClient';
import '../../assets/css/apps/accounts.css';
import { DropdownMultiOption } from '../../components/forms/dropdownMulti';
import Translate from '../../components/utils/translate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ListItemCenter from '../../components/utils/lists/listItemCenter';

const nullJSX: JSX.Element = <></>;

interface ExpenseSplit {
  userId: number;
  amount: number;
}

interface Expense {
  id: number;
  description: string;
  date: string;
  totalAmount: number;
  paidByUserId: number;
  ExpenseSplits: ExpenseSplit[];
  visible?: boolean;
}

interface Transfer {
  id: number;
  fromUserId: number;
  toUserId: number;
  amount: number;
  date: string;
  visible?: boolean;
}

interface Debt {
  id: number;
  fromUserId: number;
  toUserId: number;
  amount: number;
  homeId: number;
  visible?: boolean;
}

interface AccountHomeMember extends HomeMember {
  HomeUser: { nickname?: string };
  UserRecord: {
    id: number;
  };
}

const AppAccounts = (): JSX.Element => {
  const { t } = useTranslation('common');
  const { setNotification, setSuccessNotification } = useNotifications();
  const [popup, setPopup] = useState<JSX.Element>(nullJSX);
  const [sidebarTabs, setSidebarTabs] = useState<SidebarTab[]>([]);
  const [title, setHeader] = useState<string>('sidebar.myTasks.title');
  const [loaded, setLoaded] = useState<boolean>(false);
  const [users, setUsers] = useState<AccountHomeMember[]>([]);
  const [data, setData] = useState<(Expense | Transfer | Debt)[]>([]);

  const ExpenseTabs: SubHeaderTab[] = [
    {
      name: 'all',
      action: (e: Expense): boolean => (!e ? true : isExpense(e)),
      selected: true,
    },
    {
      name: 'byMe',
      action: (e: Expense): boolean =>
        !e
          ? true
          : isExpense(e)
          ? e.paidByUserId.toString() === localStorage.getItem('userId')
          : false,
      selected: false,
    },
    {
      name: 'splittedWith',
      action: (e: Expense): boolean =>
        !e
          ? true
          : isExpense(e)
          ? e.ExpenseSplits.filter(
              (es) => es.userId.toString() === localStorage.getItem('userId')
            ).length > 0
          : false,
      selected: false,
    },
  ];

  const [subHeaderTabs, setSubHeaderTabs] =
    useState<SubHeaderTab[]>(ExpenseTabs);

  const getSelectedSidebarTab = (): SidebarTab =>
    sidebarTabs.find((t) => t.selected) ?? sidebarTabs[0];

  const getSelectedSubHeaderTab = (): SubHeaderTab =>
    subHeaderTabs.find((t) => t.selected) ?? subHeaderTabs[0];

  useEffect(() => {
    if (!sidebarTabs.length) return;
    let selected = getSelectedSidebarTab();
    handleTitle(selected);
    handleData(selected, getSelectedSubHeaderTab());
  }, [sidebarTabs, subHeaderTabs]);

  const handleData = (
    sidebarTab: SidebarTab,
    subHeaderTab: SubHeaderTab,
    newData?: (Expense | Transfer | Debt)[]
  ): void => {
    if (!newData && !data?.length) return;

    if (!newData) newData = [...data];
    newData = newData.map((nd) => {
      return { ...nd, visible: false };
    });

    newData.forEach(
      (d) =>
        (d.visible =
          sidebarTab.action && subHeaderTab.action
            ? sidebarTab.action(d) && subHeaderTab.action(d)
            : false)
    );

    setData(sortByDate(newData));
    setLoaded(true);
  };

  const sortByDate = (
    array: (Expense | Transfer | Debt)[]
  ): (Expense | Transfer | Debt)[] => {
    array.sort((a, b) => {
      if ((!isTransfer(a) && isDebt(a)) || (!isTransfer(b) && isDebt(b)))
        return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    return array;
  };

  const getUserWithRecord = (record: number) => {
    return users.find((u) => u.UserRecord.id === record);
  };

  const getExpenseUser = (e: Expense) => {
    return getUserWithRecord(e.paidByUserId);
  };

  const getCompleteName = (user?: AccountHomeMember): string => {
    if (!user) return t('unknown');
    return user.firstname + ' ' + user.lastname;
  };

  const getExpenseElement = (e: Expense, i: number): JSX.Element => {
    return (
      <ListItem
        key={`acc-e-${i}`}
        uid={i}
        className="expense"
        onClick={[
          <h4>
            <Translate name="expenses.title.splittedWith" />:
          </h4>,
        ].concat(
          e.ExpenseSplits.map((es) =>
            getUserWithRecord(es.userId)?.Image?.url ? (
              <img
                id="img-profile"
                src={`http://localhost:4000/images/public/${
                  getUserWithRecord(es.userId)?.Image?.url
                }`}
                alt={'NA'}
                title={getCompleteName(getUserWithRecord(es.userId))}
              />
            ) : (
              <FontAwesomeIcon
                key={`rlpi-${i}`}
                icon="user-circle"
                title={getCompleteName(getUserWithRecord(es.userId))}
              ></FontAwesomeIcon>
            )
          )
        )}
      >
        <ListItemLeft key={`lil-${i}`}>
          <div className="img-text" key={`lilit-${i}`}>
            {getExpenseUser(e)?.Image?.url ? (
              <img
                id="img-profile"
                src={`http://localhost:4000/images/public/${
                  getExpenseUser(e)?.Image?.url
                }`}
                alt={'NA'}
                title={getCompleteName(getUserWithRecord(e.paidByUserId))}
              />
            ) : (
              <FontAwesomeIcon
                key={`rlpi-${i}`}
                icon="user-circle"
                title={getCompleteName(getUserWithRecord(e.paidByUserId))}
              ></FontAwesomeIcon>
            )}
            <div className="expense-lil-text">
              <h3
                key={`lil-t-${i}`}
                title={e.description.length <= 22 ? undefined : e.description}
              >
                {e.description.length >= 22
                  ? e.description.substring(0, 22) + '...'
                  : e.description}
              </h3>
              <h4 key={`lil-t-${i}-2`}>
                {
                  <Translate
                    name={`{"translate":"expenses.date","format":["${t(
                      'date.month.' +
                        new Date(e.date)
                          .toLocaleString('en-US', { month: 'short' })
                          .toLowerCase()
                    )}","${new Date(e.date).getDate()}"]}`}
                  />
                }
                <FontAwesomeIcon
                  key={`lil-t-fa-${i}`}
                  icon="circle"
                ></FontAwesomeIcon>
                {t('expenses.by')}{' '}
                <b>
                  {users.find((u) => u.UserRecord.id === e.paidByUserId)
                    ?.firstname ?? t('unknown')}
                </b>
              </h4>
            </div>
          </div>
        </ListItemLeft>
        <ListItemRight>
          <h2>
            <Translate
              name={`{"translate":"dollar","format":["${e.totalAmount}"]}`}
            />
          </h2>
        </ListItemRight>
      </ListItem>
    );
  };

  const getTransferElement = (tr: Transfer, i: number): JSX.Element => {
    return (
      <ListItem
        key={`acc-t-${i}`}
        uid={i}
        className="transfer"
        onClick={[
          <h4 className="with-accent">
            <b>{getUserWithRecord(tr.fromUserId)?.firstname ?? t('unknown')}</b>{' '}
            <Translate name="transfers.sent" />{' '}
            <b>
              <Translate
                name={`{"translate":"dollar","format":["${tr.amount}"]}`}
              />
            </b>{' '}
            <Translate name="transfers.to" />{' '}
            <b>{getUserWithRecord(tr.toUserId)?.firstname ?? t('unknown')}</b>{' '}
            <Translate name="transfers.on" />{' '}
            <Translate
              name={`{"translate":"expenses.date","format":["${t(
                'date.month.' +
                  new Date(tr.date)
                    .toLocaleString('en-US', { month: 'short' })
                    .toLowerCase()
              )}","${new Date(tr.date).getDate()}"]}`}
            />
            <Translate name="transfers.dot" />
          </h4>,
        ]}
      >
        <ListItemLeft key={`lil-${i}`}>
          <div className="img-text" key={`lilit-${i}`}>
            {getUserWithRecord(tr.fromUserId)?.Image?.url ? (
              <img
                id="img-profile"
                src={`http://localhost:4000/images/public/${
                  getUserWithRecord(tr.fromUserId)?.Image?.url
                }`}
                alt={'NA'}
                title={getCompleteName(getUserWithRecord(tr.fromUserId))}
              />
            ) : (
              <FontAwesomeIcon
                key={`rlpi-${i}`}
                icon="user-circle"
                title={getCompleteName(getUserWithRecord(tr.fromUserId))}
              ></FontAwesomeIcon>
            )}
            <div className="expense-lil-text">
              <h4 key={`lil-t-${i}`} className="name">
                {getUserWithRecord(tr.fromUserId)?.firstname ?? t('unknown')}
              </h4>
              <h4 key={`lil-t-${i}-2`}>
                <Translate name="transfers.sent" />
              </h4>
            </div>
          </div>
        </ListItemLeft>
        <ListItemCenter key={`lic-${i}`}>
          <div key={`lic-text-${i}`}>
            <h2 key={`lic-t-${i}`}>
              <b>
                <Translate
                  name={`{"translate":"dollar","format":["${tr.amount}"]}`}
                />
              </b>
            </h2>
            <h4 key={`lic-t-${i}-2`}>
              {
                <Translate
                  name={`{"translate":"expenses.date","format":["${t(
                    'date.month.' +
                      new Date(tr.date)
                        .toLocaleString('en-US', { month: 'short' })
                        .toLowerCase()
                  )}","${new Date(tr.date).getDate()}"]}`}
                />
              }
            </h4>
          </div>
        </ListItemCenter>
        <ListItemRight>
          <div className="img-text" key={`lilit-${i}`}>
            {getUserWithRecord(tr.toUserId)?.Image?.url ? (
              <img
                id="img-profile"
                src={`http://localhost:4000/images/public/${
                  getUserWithRecord(tr.toUserId)?.Image?.url
                }`}
                alt={'NA'}
                title={getCompleteName(getUserWithRecord(tr.toUserId))}
              />
            ) : (
              <FontAwesomeIcon
                key={`rlpi-${i}`}
                icon="user-circle"
                title={getCompleteName(getUserWithRecord(tr.toUserId))}
              ></FontAwesomeIcon>
            )}
            <div className="expense-lil-text">
              <h4 key={`lil-t-${i}-2`}>
                <Translate name="transfers.to" />
              </h4>
              <h4 key={`lil-t-${i}`} className="name">
                {getUserWithRecord(tr.toUserId)?.firstname ?? t('unknown')}
              </h4>
            </div>
          </div>
        </ListItemRight>
      </ListItem>
    );
  };

  const reverseDebt = (d: Debt): Debt => {
    return {
      ...d,
      fromUserId: d.toUserId,
      toUserId: d.fromUserId,
      amount: -d.amount,
    };
  };

  const groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

  const getDebtElements = (d: Debt, i: number): JSX.Element[] => {
    let orderedDebts = (
      data.filter((d) => d.visible && !isTransfer(d) && isDebt(d)) as Debt[]
    ).map((d) => (d.amount < 0 ? reverseDebt(d) : d));

    let grouped = groupBy(orderedDebts, 'fromUserId');

    let elements: JSX.Element[] = [];
    for (const [fromId, value] of Object.entries(grouped)) {
      let totalOwed = 0;
      (value as Debt[]).forEach((v) => (totalOwed += v.amount));

      let fromUser = getUserWithRecord(parseInt(fromId));

      elements.push(
        <ListItem
          key={`acc-d-${i}`}
          uid={i}
          className="debt"
          onClick={(value as Debt[]).map((v) => (
            <div className="debt-row">
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
                    key={`rlpi-${i}`}
                    icon="user-circle"
                    title={getCompleteName(getUserWithRecord(v.toUserId))}
                  ></FontAwesomeIcon>
                )}
                <h4 key={`lil-t-${i}-2`}>
                  <Translate name="transfers.to" />{' '}
                  <b>
                    {getUserWithRecord(v.toUserId)?.firstname ?? t('unknown')}
                  </b>
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
          <ListItemLeft key={`lil-${i}`}>
            <div className="img-text" key={`lilit-${i}`}>
              {fromUser?.Image?.url ? (
                <img
                  id="img-profile"
                  src={`http://localhost:4000/images/public/${fromUser?.Image?.url}`}
                  alt={'NA'}
                  title={getCompleteName(fromUser)}
                />
              ) : (
                <FontAwesomeIcon
                  key={`rlpi-${i}`}
                  icon="user-circle"
                  title={getCompleteName(fromUser)}
                ></FontAwesomeIcon>
              )}
              <div className="expense-lil-text">
                <h4 key={`lil-t-${i}`}>
                  <b>{getCompleteName(fromUser)}</b>{' '}
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
      // console.log(`${key}: ${value.map((v) => v.amount + ' ')}`);
    }
    return elements;
  };

  const getCompoundDebtsElement = (): JSX.Element[] => {
    return [<h3>COMPOUND</h3>];
  };

  const isExpense = (e: any): e is Expense =>
    'description' in e && 'totalAmount' in e && 'paidByUserId' in e;

  const isTransfer = (e: any): e is Transfer =>
    'date' in e && 'fromUserId' in e && 'toUserId' in e && 'amount' in e;

  const isDebt = (e: any): e is Debt =>
    'fromUserId' in e && 'toUserId' in e && 'amount' in e;

  useEffect(() => {
    let tabs: SidebarTab[] = [
      {
        icon: 'receipt',
        name: 'expenses',
        action: (e: Expense | Transfer | Debt): boolean =>
          !e ? true : isExpense(e),
      },
      {
        icon: 'exchange-alt',
        name: 'transfers',
        action: (t: Expense | Transfer | Debt): boolean =>
          !t ? true : isTransfer(t),
      },
      {
        icon: 'people-arrows',
        name: 'debts',
        action: (d: Expense | Transfer | Debt): boolean =>
          !d ? true : !isTransfer(d) && isDebt(d),
      },
      {
        icon: 'history',
        name: 'history',
        action: (te: Expense | Transfer | Debt): boolean =>
          !te ? true : isTransfer(te) || isExpense(te),
      },
    ].map((t, i) => {
      return {
        id: -i - 1,
        value: t.name,
        prefix: 'accounts.title.sidebar.',
        suffix: '.value',
        img: t.icon,
        handle: (tabs: SidebarTab[]) => {
          handleSidebar(tabs);
          return t.action;
        },
        action: t.action,
        selected: i === 0,
      };
    });

    setSidebarTabs(tabs);

    axios
      .get(`/accounts/${localStorage.getItem('currentHome')}`)
      .then(async (res: any) => {
        let data = [...res.data.expenses]
          .concat([...res.data.transfers])
          .concat([...res.data.debts]);
        setUsers([...res.data.users]);
        handleData(tabs[0], getSelectedSubHeaderTab(), data);
      })
      .catch((err) => {
        if (err?.response?.data) setNotification(err.response.data);
      });
  }, []);

  const handleTitle = (tab: SidebarTab): void => {
    if (!sidebarTabs.length) return;
    if (!tab.value) setHeader('tasks');
    else if (tab.id < 0) setHeader(`sidebar.${tab.value ?? 'tasks'}.title`);
    else
      setHeader(
        getTranslateJSON('sidebar.user.title', [tab.value.split(' ')[0] ?? ''])
      );
  };

  const handleSubHeader = (tab: string): void => {
    // setSubHeaderTabs(switchSubHeaderTab(subHeaderTabs, tab));
  };

  const handleSidebar = (newTabs: SidebarTab[]): void => {
    let selected = newTabs.find((x) => x.selected) ?? newTabs[0];
    let newSubHeaderTabs: SubHeaderTab[] = [];

    switch (selected.value) {
      case 'expenses':
        newSubHeaderTabs = ExpenseTabs;
        break;
      case 'transfers':
        newSubHeaderTabs = [
          {
            name: 'all',
            action: (t: Transfer): boolean => (!t ? true : isTransfer(t)),
            selected: true,
          },
          {
            name: 'fromMe',
            action: (t: Transfer): boolean =>
              !t
                ? true
                : isTransfer(t)
                ? t.fromUserId.toString() === localStorage.getItem('userId')
                : false,
            selected: false,
          },
          {
            name: 'toMe',
            action: (t: Transfer): boolean =>
              !t
                ? true
                : isTransfer(t)
                ? t.toUserId.toString() === localStorage.getItem('userId')
                : false,
            selected: false,
          },
        ];
        break;
      case 'debts':
        newSubHeaderTabs = [
          {
            name: 'all',
            action: (d: Debt): boolean =>
              !d ? true : !isTransfer(d) && isDebt(d),
            selected: true,
          },
          {
            name: 'compound',
            action: (d: Debt): boolean =>
              !d ? true : !isTransfer(d) && isDebt(d),
            selected: false,
          },
        ];
        break;
      case 'history':
        newSubHeaderTabs = [
          {
            name: 'all',
            action: (te: Transfer | Expense): boolean =>
              !te ? true : isTransfer(te) || isExpense(te),
            selected: true,
          },
          {
            name: 'includingMe',
            action: (te: Transfer | Expense): boolean => {
              if (!te) return true;
              if (isExpense(te))
                return (
                  te.paidByUserId.toString() ===
                    localStorage.getItem('userId') ||
                  te.ExpenseSplits.filter(
                    (es) =>
                      es.userId.toString() === localStorage.getItem('userId')
                  ).length > 0
                );

              if (!isTransfer(te)) return false;

              return (
                te.fromUserId.toString() === localStorage.getItem('userId') ||
                te.toUserId.toString() === localStorage.getItem('userId')
              );
            },
            selected: false,
          },
        ];
        break;
    }

    setSidebarTabs(newTabs);
    setSubHeaderTabs(newSubHeaderTabs);
  };

  const handleExpenseSubmit = (expense: any) => {
    axios({
      method: 'post',
      url: `/accounts/${localStorage.getItem('currentHome')}/expenses`,
      data: {
        expense,
      },
    })
      .then((res: any) => {
        setSuccessNotification(res.data);
        setPopup(nullJSX);
        // push res.data.expense to expense list
      })
      .catch((err: any) => {
        setNotification(err.response.data);
      });
  };

  const handleTransferSubmit = (transfer: any) => {
    axios({
      method: 'post',
      url: `/accounts/${localStorage.getItem('currentHome')}/transfers`,
      data: {
        transfer,
      },
    })
      .then((res: any) => {
        setSuccessNotification(res.data);
        setPopup(nullJSX);
        // push res.data.transfer to expense list
      })
      .catch((err: any) => {
        setNotification(err.response.data);
      });
  };

  const showExpensePopup = () => {
    setPopup(
      <ExpenseEditPopup
        onCancel={() => setPopup(nullJSX)}
        users={users.map((u) => {
          return {
            id: u.id,
            value: `${u.firstname} ${u.lastname}`,
            img: u.Image?.url ?? undefined,
            icon:
              (u.Image?.url ?? undefined) === undefined
                ? 'user-circle'
                : undefined,
            selected: false,
          } as DropdownMultiOption;
        })}
        onSubmit={(expense: any) => handleExpenseSubmit(expense)}
      />
    );
  };

  const showTransferPopup = () => {
    setPopup(
      <TransferEditPopup
        onCancel={() => setPopup(nullJSX)}
        users={users.filter(
          (u) => u.id.toString() !== localStorage.getItem('userId')
        )}
        onSubmit={(transfer: any) => handleTransferSubmit(transfer)}
      />
    );
  };

  return (
    <AppContainer
      title={title}
      appName="accounts"
      sidebar={sidebarTabs}
      subHeader={{
        tabs: subHeaderTabs,
        tabHandler: (tabs: SubHeaderTab[]) => setSubHeaderTabs(tabs),
      }}
      popup={popup}
      onAddClick={
        title === 'sidebar.expenses.title'
          ? () => showExpensePopup()
          : title === 'sidebar.transfers.title'
          ? () => showTransferPopup()
          : undefined
      }
      onAddTooltip={`${
        title === 'sidebar.expenses.title' ? 'expenses' : 'transfers'
      }.tooltip.add`}
    >
      <div className="content">
        <List key={`expense-list`} className="fill-height">
          {loaded ? (
            getSelectedSubHeaderTab().name === 'compound' ? (
              getCompoundDebtsElement()
            ) : data.filter((d) => d.visible).length ? (
              data
                .filter((d) => d.visible)
                .map((d, i) =>
                  isExpense(d)
                    ? getExpenseElement(d, i)
                    : isTransfer(d)
                    ? getTransferElement(d, i)
                    : getDebtElements(d, i)
                )
            ) : (
              <h2>
                <Translate
                  name={
                    title === 'sidebar.expenses.title'
                      ? 'noExpenses'
                      : title === 'sidebar.transfers.title'
                      ? 'noTransfers'
                      : title === 'sidebar.debts.title'
                      ? 'noDebts'
                      : 'noHistory'
                  }
                  prefix="accounts."
                />
              </h2>
            )
          ) : (
            <></>
          )}
        </List>
      </div>
    </AppContainer>
  );
};

export default AppAccounts;
