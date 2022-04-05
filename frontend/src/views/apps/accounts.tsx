import { useEffect, useState } from 'react';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useTranslation } from 'react-i18next';
import { SidebarTab, SidebarModule } from '../../components/app/sidebar';
import { SubHeaderProps, SubHeaderTab } from '../../components/app/subHeader';
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
  }, [sidebarTabs, subHeaderTabs]);

  useEffect(() => {
    axios
      .get(`/accounts/${localStorage.getItem('currentHome')}/users`)
      .then(async (res: any) => {
        setUsers(res.data.users);
      })
      .catch((err) => {
        setNotification(err.response.data);
      });

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

  return (
    <AppContainer
      title={title}
      appName="accounts"
      sidebar={sidebarTabs}
      subHeader={{
        tabs: subHeaderTabs,
        tabHandler: (tabs: SubHeaderTab[]) => setSubHeaderTabs(tabs),
      }}
    >
      <></>
    </AppContainer>
  );
};

export default AppAccounts;
