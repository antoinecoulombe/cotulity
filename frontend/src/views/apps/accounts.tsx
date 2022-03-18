import { useEffect, useState } from 'react';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useTranslation } from 'react-i18next';
import { SidebarTab, SidebarModule } from '../../components/app/sidebar';
import {
  SubHeaderProps,
  switchSubHeaderTab,
} from '../../components/app/subHeader';
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
  const [subHeader, setSubHeader] = useState<SubHeaderProps>({
    tabs: [
      {
        name: 'all',
        action: () => handleSubHeader('all'),
        selected: true,
      },
      { name: 'important', action: () => handleSubHeader('important') },
    ],
  });
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
  }, [sidebarTabs, subHeader]);

  useEffect(() => {
    axios
      .get(`/groceries/${localStorage.getItem('currentHome')}/users`)
      .then(async (res: any) => {
        setUsers(res.data.users);
      })
      .catch((err) => {
        setNotification(err.response.data);
      });

    let tabs: SidebarTab[] = [
      {
        icon: 'star',
        name: 'myTasks',
        action: (t: Expense | Transfer) => (!t ? true : false),
      },
    ].map((t, i) => {
      return {
        id: -i - 1,
        value: t.name,
        title: '',
        prefix: 'groceries.title.sidebar.',
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
    setSubHeader({ ...subHeader, tabs: switchSubHeaderTab(subHeader, tab) });
  };

  const handleSidebar = (newTabs: SidebarTab[]): void => {
    setSidebarTabs(newTabs);
  };

  return (
    <AppContainer title="accounts" appName="accounts">
      <></>
    </AppContainer>
  );
};

export default AppAccounts;
