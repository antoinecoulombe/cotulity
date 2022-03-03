import { useState, useEffect } from 'react';
import { SidebarTab } from '../../components/app/sidebar';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useTranslation } from 'react-i18next';
import { getTranslateJSON } from '../../utils/global';
import { DropdownOption } from '../../components/forms/dropdown';
import { scrollHorizontal } from '../../hooks/window';
import {
  SubHeaderProps,
  switchSubHeaderTab,
} from '../../components/app/subHeader';
import AppContainer from '../../components/app/appContainer';
import List from '../../components/utils/lists/list';
import ListItem from '../../components/utils/lists/listItem';
import ListItemLeft from '../../components/utils/lists/listLeft';
import ListItemRight from '../../components/utils/lists/listRight';
import IconToolTip from '../../components/global/iconTooltip';
import axios from '../../utils/fetchClient';
import ReactDOMServer from 'react-dom/server';
import Translate from '../../components/utils/translate';
import EditPopup from '../../components/tasks/editPopup';
import * as DateExt from '../../components/utils/date';
import '../../assets/css/apps/tasks.css';

export interface Task {
  id: number;
  name: string;
  dueDateTime: string;
  important: boolean;
  shared: boolean;
  completedOn: string | null;
  deletedAt: string | null;
  Owner?: HomeMember;
  Users?: Array<{
    id: number;
    firstname: string;
    lastname: string;
    Image: { url: string } | null;
  }>;
  visible: boolean;
}

export const initTask: Task = {
  id: -1,
  name: '',
  dueDateTime: '/@:',
  important: false,
  shared: true,
  completedOn: null,
  deletedAt: null,
  visible: false,
};

export interface HomeMember {
  id: number;
  firstname: string;
  lastname: string;
  Image: { url: string } | null;
  Tasks?: Array<{ id: number }>;
  selected?: boolean;
}

const nullJSX: JSX.Element = <></>;

const AppTasks = (): JSX.Element => {
  const { t } = useTranslation('common');
  const { setNotification, setSuccessNotification } = useNotifications();
  const [popup, setPopup] = useState<JSX.Element>(nullJSX);
  const [sidebarTabs, setSidebarTabs] = useState<SidebarTab[]>([]);
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setHeader] = useState<string>('sidebar.myTasks.title');
  const [loaded, setLoaded] = useState<boolean>(false);
  const [users, setUsers] = useState<HomeMember[]>([]);

  useEffect(() => {
    if (!sidebarTabs.length) return;
    setLoaded(true);
    let selected = sidebarTabs.find((t) => t.selected) ?? sidebarTabs[0];
    handleTitle(selected);
    handleTask(selected);
  }, [sidebarTabs, subHeader]);

  useEffect(() => {
    // get home users for sidebar
    axios
      .get(`/home/${localStorage.getItem('currentHome')}/users`)
      .then(async (res: any) => {
        // get tasks
        await axios
          .get(`/tasks/${localStorage.getItem('currentHome')}`)
          .then((res: any) => {
            setTasks(res.data.tasks);
          })
          .catch((err) => {
            setNotification(err.response.data);
          });

        // sidebar tabs (upper - categories)
        let tabs: SidebarTab[] = [
          {
            icon: 'star',
            name: 'myTasks',
            action: (t: Task) =>
              !t
                ? true
                : t.Users?.find(
                    (u) =>
                      u.id === parseInt(localStorage.getItem('userId') ?? '-2')
                  ) != null &&
                  t.deletedAt == null &&
                  t.completedOn == null,
          },
          {
            icon: 'calendar',
            name: 'upcoming',
            action: (t: Task) =>
              !t ? true : t.completedOn == null && t.deletedAt == null,
          },
          {
            icon: 'lock',
            name: 'private',
            action: (t: Task) =>
              !t
                ? true
                : t.Users?.find(
                    (u) =>
                      u.id === parseInt(localStorage.getItem('userId') ?? '-2')
                  ) &&
                  !t.shared &&
                  t.deletedAt == null,
          },
          {
            icon: 'history',
            name: 'history',
            action: (t: Task) =>
              !t ? true : t.completedOn !== null && t.deletedAt == null,
          },
          {
            icon: 'trash',
            name: 'trash',
            action: (t: Task) => (!t ? true : t.deletedAt != null),
          },
        ].map((t, i) => {
          return {
            id: -i - 1,
            value: t.name,
            title: '',
            prefix: 'tasks.title.sidebar.',
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

        // sidebar tabs (lower - user)
        tabs = tabs.concat(
          res.data.users.map((m) => {
            return {
              id: m.id,
              value: `${
                m.firstname.length > 9
                  ? m.firstname.substring(0, 9) + '...'
                  : m.firstname
              } ${m.lastname[0].toUpperCase()}.`,
              img: m.Image?.url,
              count: m.Tasks.length,
              isUser: true,
              handle: (tabs: SidebarTab[]) => handleSidebar(tabs),
              action: (t: Task) => t.Owner?.id === m.id,
            };
          })
        );
        setSidebarTabs(tabs);
        setUsers(res.data.users);
      })
      .catch((err) => {
        setNotification(err.response.data);
      });
    // handleOpenAppResize(250); // use with .fill-height on content
  }, []);

  const handleSubHeader = (tab: string): void => {
    setSubHeader({ ...subHeader, tabs: switchSubHeaderTab(subHeader, tab) });
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

  const handleSidebar = (newTabs: SidebarTab[]): void => {
    setSidebarTabs(newTabs);
  };

  const handleTask = (tab?: SidebarTab): void => {
    let newTasks = [...tasks];
    let important =
      subHeader.tabs.find((ht) => ht.selected)?.name === 'important';

    newTasks.forEach((t) => {
      t.visible = false;

      if (
        (!important || (important && t.important)) &&
        tab?.action &&
        (tab.action(t) as boolean)
      )
        t.visible = true;
    });
    setTasks(newTasks);
  };

  const getTagColor = (dueDate: string): string => {
    let d = new Date(dueDate);
    let dNow = new Date(Date.now());
    let daysDiff = DateExt.getDaysDiff(d, dNow);

    if (DateExt.isSameDay(dNow, d) || DateExt.isTomorrow(dNow, d)) return 'red';
    if (daysDiff < 4) return 'orange';
    if (daysDiff < 7) return 'yellow';
    return 'green';
  };

  const handleSubmit = (task: Task): void => {
    // axios({
    //   method: task.id === -1 ? 'post' : 'put',
    //   url: `/tasks/${localStorage.getItem('currentHome')}/${
    //     task.id === -1 ? '' : task.id
    //   }`,
    //   data: {
    //     task,
    //   },
    // })
    //   .then((res: any) => {
    //     let newUpcoming = [...upcomingTasks];
    //     newUpcoming.push(res.data.task);
    //     setUpcomingTasks(newUpcoming);
    //     setPopup(nullJSX);
    //     setSuccessNotification(res.data);
    //   })
    //   .catch((err) => {
    //     setNotification(err.response.data);
    //   });
  };

  const showPopup = (task?: Task): void => {
    // setPopup(
    //   <EditPopup
    //     onCancel={() => setPopup(nullJSX)}
    //     task={task}
    //     users={users.map((u) => {
    //       return {
    //         id: u.id,
    //         value: `${u.firstname} ${u.lastname}`,
    //         img: u.Image?.url ?? undefined,
    //         icon:
    //           (u.Image?.url ?? undefined) === undefined
    //             ? 'user-circle'
    //             : undefined,
    //         selected: !task
    //           ? false
    //           : (task.Users?.find((tu) => tu.id === u.id) ?? null) != null,
    //       } as DropdownOption;
    //     })}
    //     onSubmit={(task: Task) => handleSubmit(task)}
    //     onDelete={task ? (id: number) => deleteTask(id, true) : undefined}
    //   />
    // );
  };

  const destroyTaskUpcoming = (id: number, closePopup?: boolean): void => {
    // let newUpcoming = [...upcomingTasks];
    // let i = newUpcoming.findIndex((t) => t.id === id);
    // if (i >= 0) {
    //   axios
    //     .delete(`/tasks/${localStorage.getItem('currentHome')}/${id}`)
    //     .then((res: any) => {
    //       if (res.data.deletedAt == null) {
    //         newUpcoming.splice(i, 1);
    //         setCompletedTasks(newUpcoming);
    //       } else {
    //         newUpcoming[i].deletedAt = res.data.deletedAt;
    //         setUpcomingTasks(newUpcoming);
    //       }
    //       if (closePopup) setPopup(nullJSX);
    //     })
    //     .catch((err) => {
    //       setNotification(err.response.data);
    //     });
    // }
  };

  const destroyTaskCompleted = (id: number, closePopup?: boolean): void => {
    // let newCompleted = [...completedTasks];
    // let i = newCompleted.findIndex((t) => t.id === id);
    // if (i >= 0) {
    //   axios
    //     .delete(`/tasks/${localStorage.getItem('currentHome')}/${id}`)
    //     .then((res: any) => {
    //       if (res.data.deletedAt == null) {
    //         newCompleted.splice(i, 1);
    //         setCompletedTasks(newCompleted);
    //       } else {
    //         newCompleted[i].deletedAt = res.data.deletedAt;
    //         setCompletedTasks(newCompleted);
    //       }
    //       if (closePopup) setPopup(nullJSX);
    //     })
    //     .catch((err) => {
    //       setNotification(err.response.data);
    //     });
    // }
  };

  const deleteTask = (id: number, closePopup?: boolean): void => {
    // if (upcomingTasks.find((t) => t.id === id))
    //   destroyTaskUpcoming(id, closePopup);
    // else destroyTaskCompleted(id, closePopup);
  };

  const completeTask = (id: number): void => {
    // let newCompleted = [...completedTasks];
    // let newUpcoming = [...upcomingTasks];
    // let i = newUpcoming.findIndex((t) => t.id === id);
    // if (i >= 0) {
    //   axios
    //     .put(`/tasks/${localStorage.getItem('currentHome')}/${id}/do`)
    //     .then((res: any) => {
    //       newUpcoming[i].completedOn = res.data.completedOn;
    //       newCompleted.push(newUpcoming[i]);
    //       newUpcoming.splice(i, 1);
    //       setUpcomingTasks(newUpcoming);
    //       setCompletedTasks(newCompleted);
    //     })
    //     .catch((err) => {
    //       setNotification(err.response.data);
    //     });
    // }
  };

  const unCompleteTask = (id: number): void => {
    // let newCompleted = [...completedTasks];
    // let newUpcoming = [...upcomingTasks];
    // let i = newCompleted.findIndex((t) => t.id === id);
    // if (i >= 0) {
    //   axios
    //     .put(`/tasks/${localStorage.getItem('currentHome')}/${id}/undo`)
    //     .then((res: any) => {
    //       newCompleted[i].completedOn = null;
    //       newUpcoming.push(newCompleted[i]);
    //       newCompleted.splice(i, 1);
    //       setUpcomingTasks(newUpcoming);
    //       setCompletedTasks(newCompleted);
    //     })
    //     .catch((err) => {
    //       setNotification(err.response.data);
    //     });
    // }
  };

  const getTranslatedMonthAndDay = (date: string): JSX.Element => {
    let d = DateExt.getMonthAndDay(date);
    if (typeof d === 'string') return t(d);

    let json = getTranslateJSON('date.format', [d.day, t(d.month)]);
    return <Translate name={json}></Translate>;
  };

  const iconStyle = {
    iconWidth: 34,
    tooltipMultiplier: 10,
  };

  const handleHorizontalScroll = (e: any): void => {};

  return (
    <AppContainer
      title={title}
      appName="tasks"
      subHeader={subHeader}
      sidebar={sidebarTabs}
      popup={popup}
      onAddClick={() => showPopup(undefined)}
    >
      <div className="content">
        <List>
          {loaded ? (
            tasks?.filter((t) => t.visible).length ? (
              tasks
                .filter((t) => t.visible)
                .map((t) => (
                  <ListItem key={`task-${t.id}`} uid={t.id}>
                    <ListItemLeft>
                      <div className="generic-input">
                        <input
                          id="c2"
                          type="checkbox"
                          onClick={() =>
                            t.completedOn == null
                              ? completeTask(t.id)
                              : unCompleteTask(t.id)
                          }
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
                            id="involved-users-tasks"
                            style={t.Users.length < 5 ? { width: 'auto' } : {}}
                            onWheel={scrollHorizontal}
                          >
                            {t.Users.map((u) =>
                              u.Image?.url ? (
                                <img
                                  key={`involved-${t.id}-${u.id}`}
                                  src={`http://localhost:3000/images/public/${u.Image.url}`}
                                  alt={`${u.firstname[0]}${u.lastname[0]}`.toUpperCase()}
                                />
                              ) : (
                                <div
                                  key={`involved-${t.id}-${u.id}`}
                                  className="user-initials"
                                >
                                  {`${u.firstname[0].toUpperCase()}${u.lastname[0].toUpperCase()}`}
                                </div>
                              )
                            )}
                          </div>
                          <div className={`tag ${getTagColor(t.dueDateTime)}`}>
                            {getTranslatedMonthAndDay(t.dueDateTime)}
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
              <h2>
                <Translate name="noTasks" prefix="tasks." />
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

export default AppTasks;
