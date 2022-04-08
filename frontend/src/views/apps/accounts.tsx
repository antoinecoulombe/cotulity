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
  settled: boolean;
}

interface Expense {
  id: number;
  description: string;
  date: string;
  totalAmount: number;
  PaidBy: HomeMember;
  SplittedWith: ExpenseSplit[];
}

interface Transfer {
  fromUserId: number;
  toUserId: number;
}

interface AccountHomeMember extends HomeMember {}

const AppAccounts = (): JSX.Element => {
  const { t } = useTranslation('common');
  const { setNotification, setSuccessNotification } = useNotifications();
  const [popup, setPopup] = useState<JSX.Element>(nullJSX);
  const [sidebarTabs, setSidebarTabs] = useState<SidebarTab[]>([]);
  const [sidebarModules, setSidebarModules] = useState<SidebarModule[]>([]);
  const [subHeaderTabs, setSubHeaderTabs] = useState<SubHeaderTab[]>([
    {
      name: 'all',
      action: () => handleSubHeader('all'),
      selected: true,
    },
    {
      name: 'byMe',
      action: () => handleSubHeader('byMe'),
      selected: false,
    },
    {
      name: 'splittedWith',
      action: () => handleSubHeader('splittedWith'),
      selected: false,
    },
  ]);
  const [title, setHeader] = useState<string>('sidebar.myTasks.title');
  const [loaded, setLoaded] = useState<boolean>(false);
  const [users, setUsers] = useState<HomeMember[]>([]);

  const getSelectedTab = (): SidebarTab =>
    sidebarTabs.find((t) => t.selected) ?? sidebarTabs[0];

  useEffect(() => {
    if (!sidebarTabs.length) return;
    setLoaded(true);
    let selected = getSelectedTab();
    handleTitle(selected);
    //handle expenses and transfers
  }, [sidebarTabs, subHeaderTabs]);

  useEffect(() => {
    let tabs: SidebarTab[] = [
      {
        icon: 'receipt',
        name: 'expenses',
        action: (t: Expense | Transfer) => (!t ? true : false),
      },
      {
        icon: 'exchange-alt',
        name: 'transfers',
        action: (t: Expense | Transfer) => (!t ? true : false),
      },
      {
        icon: 'people-arrows',
        name: 'debts',
        action: (t: Expense | Transfer) => (!t ? true : false),
      },
      {
        icon: 'history',
        name: 'history',
        action: (t: Expense | Transfer) => (!t ? true : false),
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
      .get(`/accounts/${localStorage.getItem('currentHome')}/users`)
      .then(async (res: any) => {
        setUsers([...res.data.users]);
      })
      .catch((err) => {
        setNotification(err.response.data);
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
        newSubHeaderTabs = [
          {
            name: 'all',
            action: () => handleSubHeader('all'),
            selected: true,
          },
          {
            name: 'byMe',
            action: () => handleSubHeader('byMe'),
            selected: false,
          },
          {
            name: 'splittedWith',
            action: () => handleSubHeader('splittedWith'),
            selected: false,
          },
        ];
        break;
      case 'transfers':
        newSubHeaderTabs = [
          {
            name: 'all',
            action: () => handleSubHeader('all'),
            selected: true,
          },
          {
            name: 'fromMe',
            action: () => handleSubHeader('fromMe'),
            selected: false,
          },
          {
            name: 'toMe',
            action: () => handleSubHeader('toMe'),
            selected: false,
          },
        ];
        break;
      case 'debts':
        newSubHeaderTabs = [
          {
            name: 'all',
            action: () => handleSubHeader('all'),
            selected: true,
          },
          {
            name: 'compound',
            action: () => handleSubHeader('compound'),
            selected: false,
          },
        ];
        break;
      case 'history':
        newSubHeaderTabs = [
          {
            name: 'all',
            action: () => handleSubHeader('all'),
            selected: true,
          },
          {
            name: 'includingMe',
            action: () => handleSubHeader('includingMe'),
            selected: false,
          },
        ];
        break;
    }
    setSidebarTabs(newTabs);
    setSubHeaderTabs(newSubHeaderTabs);
  };

  const handleExpenseSubmit = (expense: any) => {
    console.log(expense);
    // axios({
    //   method: 'post',
    //   url: `/accounts/${localStorage.getItem('currentHome')}/expenses`,
    //   data: {
    //     expense,
    //   },
    // })
    //   .then((res: any) => {
    //     // res.data
    //   })
    //   .catch((err: any) => {
    //     setNotification(err.response.data);
    //   });
  };

  const handleTransferSubmit = (transfer: any) => {
    console.log(transfer);
    // axios({
    //   method: 'post',
    //   url: `/accounts/${localStorage.getItem('currentHome')}/transfers`,
    //   data: {
    //     transfer,
    //   },
    // })
    //   .then((res: any) => {
    //     // res.data
    //   })
    //   .catch((err: any) => {
    //     setNotification(err.response.data);
    //   });
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
          : () => showTransferPopup()
      }
      onAddTooltip={`${
        title === 'sidebar.expenses.title' ? 'expenses' : 'transfers'
      }.tooltip.add`}
    >
      <div className="content">
        <List key={`expense-list`} className="fill-height">
          {loaded ? (
            <ListItem key={`expense-1`} uid={1}>
              <></>
            </ListItem>
          ) : (
            <></>
          )}
        </List>
      </div>
    </AppContainer>
  );
};

export default AppAccounts;
