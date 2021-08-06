import React, { useState, useEffect } from 'react';
import {
  SubHeaderProps,
  switchSubHeaderTab,
} from '../../components/app/subHeader';
import {
  SidebarProps,
  switchSidebarTab,
  switchSidebarUserTab,
} from '../../components/app/sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNotifications } from '../../contexts/NotificationsContext';
import AppContainer from '../../components/app/appContainer';
import List from '../../components/utils/lists/list';
import ListItem from '../../components/utils/lists/listItem';
import ListItemLeft from '../../components/utils/lists/listLeft';
import ListItemRight from '../../components/utils/lists/listRight';
import IconToolTip from '../../components/global/iconTooltip';
import axios from '../../utils/fetchClient';
import '../../assets/css/tasks.css';
import Tooltip from '../../components/global/tooltip';
import ReactDOMServer from 'react-dom/server';
import Translate from '../../components/utils/translate';
import EditPopup from '../../components/tasks/editPopup';
import * as DateExt from '../../components/utils/date';

export interface Task {
  id: number;
  name: string;
  dueDateTime: string;
  important: boolean;
  shared: boolean;
  completedOn: string | null;
  deletedAt: string | null;
  Owner?: {
    id: number;
    firstname: string;
    lastname: string;
    Image: { url: string } | null;
  };
  Users?: Array<{
    id: number;
    firstname: string;
    lastname: string;
    Image: { url: string } | null;
  }>;
}

export const initTask: Task = {
  id: -1,
  name: '',
  dueDateTime: '/@:',
  important: false,
  shared: true,
  completedOn: null,
  deletedAt: null,
};

const nullJSX: JSX.Element = <></>;

export default function AppTasks() {
  const { setNotification, setErrorNotification, setSuccessNotification } =
    useNotifications();
  const [popup, setPopup] = useState<JSX.Element>(nullJSX);
  const tabs: any = [
    { icon: 'star', name: 'myTasks' },
    { icon: 'calendar', name: 'upcoming' },
    { icon: 'hashtag', name: 'important' },
    { icon: 'lock', name: 'private' },
    { icon: 'history', name: 'history' },
    { icon: 'trash', name: 'trash' },
  ].map((t, i) => {
    return {
      icon: t.icon,
      name: t.name,
      prefix: 'tasks.sidebar.',
      action: () => handleSidebar(t.name),
      selected: i == 0,
    };
  });

  const [sidebar, setSidebar] = useState<SidebarProps>({
    tabs: tabs,
    userTabs: [
      {
        user: {
          id: 1,
          firstname: 'Antoine',
          lastname: 'Coulombe',
          taskCount: 4,
        },
        action: () => handleSidebarUser(1),
      },
      {
        user: {
          id: 2,
          firstname: 'Alexandre',
          lastname: 'Beausoleil',
          taskCount: 0,
        },
        action: () => handleSidebarUser(2),
      },
      {
        user: {
          id: 3,
          firstname: 'Charles-andré',
          lastname: 'Doe',
          taskCount: 1,
        },
        action: () => handleSidebarUser(3),
      },
      {
        user: {
          id: 4,
          firstname: 'Charles-andré',
          lastname: 'Doe',
          taskCount: 1,
        },
        action: () => handleSidebarUser(3),
      },
    ],
  });
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
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]); // shown when anything but 'Completed' is selected on taskbar
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]); // shown when 'Completed' is selected on taskbar
  const [shownTasks, setShownTasks] = useState<Task[]>([]); // currently visible

  useEffect(() => {
    // get users in home with task count
    axios
      .get(`/tasks/${localStorage.getItem('currentHome')}/upcoming`)
      .then((res: any) => {
        setShownTasks(res.data.tasks);
      })
      .catch((err) => {
        setNotification(err.response.data);
      });
    // get all upcoming tasks (completed date = null)
    // get all completed tasks
  }, []);

  // my tasks -> shown tasks = upcoming tasks associated with localStorage.getItem('userId')
  // created by me -> shown tasks = upcoming tasks where ownerId = localStorage.getItem('userId')
  // important -> shown tasks = upcoming tasks that are important
  // completed -> shown tasks = request past tasks

  // important (subHeader) -> filter shown tasks that are important
  // involved (subHeader) -> filter shown tasks that are associated with localStorage.getItem('userId')
  // this week (subHeader) -> filter shown tasks where completed date > today - 7 days

  function handleSubHeader(tab: string) {
    setSubHeader({ ...subHeader, tabs: switchSubHeaderTab(subHeader, tab) });
  }

  function handleSidebar(tab: string) {
    setSidebar({ ...sidebar, tabs: switchSidebarTab(sidebar, tab) });
  }

  function handleSidebarUser(id: number) {
    setSidebar({ ...sidebar, userTabs: switchSidebarUserTab(sidebar, id) });
  }

  function getTagColor(dueDate: string) {
    let d = new Date(dueDate);
    let dNow = new Date(Date.now());
    let daysDiff = DateExt.getDaysDiff(d, dNow);

    if (DateExt.isSameDay(dNow, d) || DateExt.isTomorrow(dNow, d)) return 'red';
    if (daysDiff < 4) return 'orange';
    if (daysDiff < 7) return 'yellow';
    return 'green';
  }

  function closePopup() {
    setPopup(nullJSX);
  }

  function handleEditSubmit(task: Task) {}

  function showPopup(task?: Task) {
    setPopup(
      <EditPopup
        onCancel={closePopup}
        task={task}
        onSubmit={(task: Task) => handleEditSubmit(task)}
        onDelete={task ? (id: number) => deleteTask(id) : undefined}
      />
    );
  }

  function deleteTask(id: number) {
    axios
      .delete(`/tasks/${localStorage.getItem('currentHome')}/${id}`)
      .then((res: any) => {
        setSuccessNotification(res.data);
        // remove task with id from upcoming tasks
        // remove task with id from shown tasks
      })
      .catch((err) => {
        setNotification(err.response.data);
      });
  }

  function completeTask(id: number) {
    console.log('complete');
  }

  const iconStyle = {
    iconWidth: 34,
    tooltipMultiplier: 10,
  };

  return (
    <AppContainer
      title="tasks"
      appName="tasks"
      subHeader={subHeader}
      sidebar={sidebar}
      popup={popup}
      onAddClick={() => showPopup()}
    >
      <div className="content">
        <List>
          {shownTasks.length > 0 ? (
            shownTasks.map((t) => (
              <ListItem key={`task-${t.id}`} uid={t.id}>
                <ListItemLeft>
                  <div className="generic-input">
                    <input
                      id="c2"
                      type="checkbox"
                      onClick={() => completeTask(t.id)}
                    />
                  </div>
                  <h3>{t.name}</h3>
                  {t.important && (
                    <IconToolTip
                      className="icon"
                      icon="exclamation-circle"
                      error={true}
                      style={{ iconWidth: 22, tooltipMultiplier: 5 }}
                    >
                      subHeader.important
                    </IconToolTip>
                  )}
                </ListItemLeft>
                <ListItemRight>
                  {t.Users && (
                    <>
                      <div
                        className="involved-users"
                        style={t.Users.length < 5 ? { width: 'auto' } : {}}
                      >
                        {t.Users.map((u) =>
                          u.Image?.url ? (
                            <img
                              key={`involved-${t.id}-${u.id}`}
                              src={`http://localhost:3000/images/public/${u.Image.url}`}
                            />
                          ) : (
                            <>
                              <div
                                className="user-initials"
                                key={`involved-${t.id}-${u.id}`}
                              >
                                {`${u.firstname[0].toUpperCase()}${u.lastname[0].toUpperCase()}`}
                              </div>
                            </>
                          )
                        )}
                      </div>
                      <div className={`tag ${getTagColor(t.dueDateTime)}`}>
                        {DateExt.getMonthAndDay(t.dueDateTime)}
                      </div>
                    </>
                  )}

                  <IconToolTip
                    icon="pen"
                    style={iconStyle}
                    circled={{ value: true, multiplier: 0.45 }}
                    onClick={() => showPopup(t)}
                  >
                    {ReactDOMServer.renderToStaticMarkup(
                      <Translate
                        name="editHome"
                        prefix="homes.action."
                      ></Translate>
                    )}
                  </IconToolTip>
                  <IconToolTip
                    icon="times-circle"
                    style={iconStyle}
                    error={true}
                    onClick={(e) => deleteTask(t.id)}
                  >
                    {ReactDOMServer.renderToStaticMarkup(
                      <Translate
                        name="deleteHome"
                        prefix="homes.action."
                      ></Translate>
                    )}
                  </IconToolTip>
                </ListItemRight>
              </ListItem>
            ))
          ) : (
            <></>
          )}
        </List>
      </div>
    </AppContainer>
  );
}
