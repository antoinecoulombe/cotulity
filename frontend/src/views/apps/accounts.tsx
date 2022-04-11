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

  const getExpenseElement = (e: Expense): JSX.Element => {
    return (
      <ListItem key={`acc-e-${e.id}`} uid={e.id}>
        <h3>
          EXPENSE '{e.description}' AT {e.date}
        </h3>
      </ListItem>
    );
  };

  const getTransferElement = (t: Transfer): JSX.Element => {
    return (
      <ListItem key={`acc-t-${t.id}`} uid={t.id}>
        <h3>
          TRANSFER FROM {t.fromUserId} TO {t.toUserId}
        </h3>
      </ListItem>
    );
  };

  const getDebtElement = (d: Debt): JSX.Element => {
    return (
      <ListItem key={`acc-d-${d.id}`} uid={d.id}>
        <h3>
          DEBT FROM {d.fromUserId} TO {d.toUserId}
        </h3>
      </ListItem>
    );
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
                .map((d) =>
                  isExpense(d)
                    ? getExpenseElement(d)
                    : isTransfer(d)
                    ? getTransferElement(d)
                    : getDebtElement(d)
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
