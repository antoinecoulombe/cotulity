import { useEffect, useState } from 'react';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useTranslation } from 'react-i18next';
import { SidebarTab } from '../../components/app/sidebar';
import { SubHeaderTab } from '../../components/app/subHeader';
import { HomeMember } from './homes';
import { getTranslateJSON, groupBy } from '../../utils/global';
import { DropdownMultiOption } from '../../components/forms/dropdownMulti';
import { default as ExpenseEditPopup } from '../../components/expenses/editPopup';
import { default as TransferEditPopup } from '../../components/transfers/editPopup';
import axios from '../../utils/fetchClient';
import AppContainer from '../../components/app/appContainer';
import List from '../../components/utils/lists/list';
import ListItemDebt from '../../components/debts/listItemDebt';
import ListItemExpense from '../../components/expenses/listItemExpense';
import ListItemTransfer from '../../components/transfers/listItemTransfer';
import CompoundDebts from '../../components/debts/compoundDebts';
import Translate from '../../components/utils/translate';
import '../../assets/css/apps/accounts.css';

const nullJSX: JSX.Element = <></>;

// #region Interfaces

export interface ExpenseSplit {
  userId: number;
  amount: number;
}

export interface Expense {
  id: number;
  description: string;
  date: string;
  totalAmount: number;
  paidByUserId: number;
  ExpenseSplits: ExpenseSplit[];
  visible?: boolean;
}

export interface Transfer {
  id: number;
  fromUserId: number;
  toUserId: number;
  amount: number;
  date: string;
  visible?: boolean;
}

export interface Debt {
  id: number;
  fromUserId: number;
  toUserId: number;
  amount: number;
  homeId: number;
  visible?: boolean;
}

export interface AccountHomeMember extends HomeMember {
  HomeUser: { nickname?: string };
  UserRecord: {
    id: number;
  };
}

// #endregion

export const getUserWithRecord = (
  users: AccountHomeMember[],
  record: number
) => {
  return users.find((u) => u.UserRecord.id === record);
};

const AppAccounts = (): JSX.Element => {
  const subHeaderTabsObject: { [key: string]: SubHeaderTab[] } = {
    expenses: [
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
    ],
    transfers: [
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
    ],
    debts: [
      {
        name: 'all',
        action: (d: Debt): boolean => (!d ? true : !isTransfer(d) && isDebt(d)),
        selected: true,
      },
      {
        name: 'compound',
        action: (d: Debt): boolean => (!d ? true : !isTransfer(d) && isDebt(d)),
        selected: false,
      },
    ],
    history: [
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
              te.paidByUserId.toString() === localStorage.getItem('userId') ||
              te.ExpenseSplits.filter(
                (es) => es.userId.toString() === localStorage.getItem('userId')
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
    ],
  };

  // Hooks

  const { t } = useTranslation('common');
  const { setNotification, setSuccessNotification } = useNotifications();

  // States

  const [popup, setPopup] = useState<JSX.Element>(nullJSX);
  const [sidebarTabs, setSidebarTabs] = useState<SidebarTab[]>([]);
  const [title, setHeader] = useState<string>('sidebar.myTasks.title');
  const [loaded, setLoaded] = useState<boolean>(false);
  const [users, setUsers] = useState<AccountHomeMember[]>([]);
  const [data, setData] = useState<(Expense | Transfer | Debt)[]>([]);
  const [subHeaderTabs, setSubHeaderTabs] = useState<SubHeaderTab[]>(
    subHeaderTabsObject['expenses']
  );

  // #region Helpers

  const reverseDebt = (d: Debt): Debt => {
    return {
      ...d,
      fromUserId: d.toUserId,
      toUserId: d.fromUserId,
      amount: -d.amount,
    };
  };

  const isExpense = (e: any): e is Expense =>
    'description' in e && 'totalAmount' in e && 'paidByUserId' in e;

  const isTransfer = (e: any): e is Transfer =>
    'date' in e && 'fromUserId' in e && 'toUserId' in e && 'amount' in e;

  const isDebt = (e: any): e is Debt =>
    'fromUserId' in e && 'toUserId' in e && 'amount' in e;

  const titleIs = (equalTo: string): boolean =>
    title === `sidebar.${equalTo}.title`;

  // #endregion

  // #region Init

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

  // #endregion

  // #region Sidebar, Header and SubHeader handlers

  const getSelectedSidebarTab = (): SidebarTab =>
    sidebarTabs.find((t) => t.selected) ?? sidebarTabs[0];

  const getSelectedSubHeaderTab = (): SubHeaderTab =>
    subHeaderTabs.find((t) => t.selected) ?? subHeaderTabs[0];

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

  useEffect(() => {
    if (!sidebarTabs.length) return;
    let selected = getSelectedSidebarTab();
    handleTitle(selected);
    handleData(selected, getSelectedSubHeaderTab());
  }, [sidebarTabs, subHeaderTabs]);

  const handleSidebar = (newTabs: SidebarTab[]): void => {
    let selected = newTabs.find((x) => x.selected) ?? newTabs[0];
    setSidebarTabs(newTabs);
    setSubHeaderTabs([...subHeaderTabsObject[selected.value]]);
  };

  const handleTitle = (tab: SidebarTab): void => {
    if (!sidebarTabs.length) return;
    if (!tab.value) setHeader('tasks');
    else if (tab.id < 0) setHeader(`sidebar.${tab.value ?? 'tasks'}.title`);
    else
      setHeader(
        getTranslateJSON('sidebar.user.title', [tab.value.split(' ')[0] ?? ''])
      );
  };

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

  // #endregion

  // #region Debts

  const getDebtElements = (): JSX.Element[] => {
    let orderedDebts = (
      data.filter((d) => d.visible && !isTransfer(d) && isDebt(d)) as Debt[]
    ).map((d) => (d.amount < 0 ? reverseDebt(d) : d));

    let grouped = groupBy(orderedDebts, 'fromUserId');

    let elements: JSX.Element[] = [];
    for (const [fromId, value] of Object.entries(grouped)) {
      let fromUser = getUserWithRecord(users, parseInt(fromId));

      if (fromUser)
        elements.push(
          <ListItemDebt
            fromUser={fromUser}
            debts={value as Debt[]}
            users={users}
            key={`debt-from-${fromUser.id}`}
          />
        );
    }
    return elements;
  };

  const getCompoundDebtsElement = (): JSX.Element => {
    return <CompoundDebts users={users} />;
  };

  // #endregion

  // #region Expenses

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
        // TODO: HANDLE NEW EXPENSE -> push res.data.expense to expense list
      })
      .catch((err: any) => {
        setNotification(err.response.data);
      });
  };

  const getExpenseElement = (e: Expense): JSX.Element => {
    return <ListItemExpense expense={e} users={users} key={e.id} />;
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

  // #endregion

  // #region Transfers

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
        // TODO: HANDLE NEW TRANSFER -> push res.data.transfer to expense list
      })
      .catch((err: any) => {
        setNotification(err.response.data);
      });
  };

  const getTransferElement = (tr: Transfer): JSX.Element => {
    return <ListItemTransfer transfer={tr} users={users} key={tr.id} />;
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

  // #endregion

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
        titleIs('expenses')
          ? () => showExpensePopup()
          : titleIs('transfers')
          ? () => showTransferPopup()
          : undefined
      }
      onAddTooltip={`${
        titleIs('expenses') ? 'expenses' : 'transfers'
      }.tooltip.add`}
    >
      <div className="content">
        <List key={`expense-list`} className="fill-height">
          {loaded ? (
            titleIs('debts') ? (
              getSelectedSubHeaderTab().name === 'compound' ? (
                getCompoundDebtsElement()
              ) : (
                getDebtElements()
              )
            ) : data.filter((d) => d.visible).length ? (
              data
                .filter((d) => d.visible)
                .map((d, i) =>
                  isExpense(d)
                    ? getExpenseElement(d)
                    : getTransferElement(d as Transfer)
                )
            ) : (
              <h2>
                <Translate
                  name={
                    titleIs('expenses')
                      ? 'noExpenses'
                      : titleIs('transfers')
                      ? 'noTransfers'
                      : titleIs('debts')
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
