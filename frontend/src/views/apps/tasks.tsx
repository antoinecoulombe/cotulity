import { useState, useEffect } from 'react';
import { SidebarTab } from '../../components/app/sidebar';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useTranslation } from 'react-i18next';
import { getTranslateJSON } from '../../utils/global';
import { DropdownMultiOption } from '../../components/forms/dropdownMulti';
import { scrollHorizontal } from '../../hooks/window';
import { SubHeaderTab } from '../../components/app/subHeader';
import { HomeMember } from './homes';
import axios from '../../utils/fetchClient';
import ReactDOMServer from 'react-dom/server';
import AppContainer from '../../components/app/appContainer';
import EditPopup from '../../components/tasks/editPopup';
import IconToolTip from '../../components/global/iconTooltip';
import List from '../../components/utils/lists/list';
import ListItem from '../../components/utils/lists/listItem';
import ListItemLeft from '../../components/utils/lists/listLeft';
import ListItemRight from '../../components/utils/lists/listRight';
import Translate from '../../components/utils/translate';
import * as DateExt from '../../components/utils/date';
import '../../assets/css/apps/tasks.css';

export interface Task {
  id: number;
  name: string;
  shared: boolean;
  repeat: string;
  untilDate: string;
  Owner?: TaskHomeMember;
  Occurences: TaskOccurence[];
}

export const initTask: Task = {
  id: -1,
  name: '',
  shared: true,
  repeat: 'none',
  untilDate: '/@:',
  Occurences: [],
};

export interface TaskUser {
  id: number;
  firstname: string;
  lastname: string;
  Image: { url: string } | null;
}

export interface TaskOccurence {
  id: number;
  completedOn: string | null;
  deletedAt: string | null;
  dueDateTime: string;
  Users?: TaskUser[];
  important: boolean;
  visible: boolean;
  Task: Task;
}

export const initTaskOccurence: TaskOccurence = {
  id: -1,
  dueDateTime: '/@:',
  completedOn: null,
  deletedAt: null,
  visible: false,
  important: false,
  Task: initTask,
};

export interface TaskHomeMember extends HomeMember {
  Tasks?: Array<{ id: number }>;
  selected?: boolean;
}

const nullJSX: JSX.Element = <></>;

const AppTasks = (): JSX.Element => {
  const { t } = useTranslation('common');
  const { setNotification, setSuccessNotification } = useNotifications();
  const [popup, setPopup] = useState<JSX.Element>(nullJSX);
  const [sidebarTabs, setSidebarTabs] = useState<SidebarTab[]>([]);
  const [subHeaderTabs, setSubHeaderTabs] = useState<SubHeaderTab[]>([
    {
      name: 'all',
      action: () => {},
      selected: true,
    },
    { name: 'important', action: () => {} },
  ]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setHeader] = useState<string>('sidebar.myTasks.title');
  const [loaded, setLoaded] = useState<boolean>(false);
  const [users, setUsers] = useState<TaskHomeMember[]>([]);

  useEffect(() => {
    if (!sidebarTabs.length) return;
    setLoaded(true);
    let selected = getSelectedTab();
    handleTitle(selected);
    handleTask(selected, undefined, false);
  }, [sidebarTabs, subHeaderTabs]);

  useEffect(() => {
    // get home users for sidebar
    axios
      .get(`/tasks/${localStorage.getItem('currentHome')}/users`)
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
            action: (t: TaskOccurence): boolean =>
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
            action: (t: TaskOccurence): boolean =>
              !t ? true : t.completedOn == null && t.deletedAt == null,
          },
          {
            icon: 'lock',
            name: 'private',
            action: (t: TaskOccurence, shared: boolean): boolean =>
              !t
                ? true
                : (
                    t.Users?.filter(
                      (u) =>
                        u.id ===
                        parseInt(localStorage.getItem('userId') ?? '-2')
                    ) ?? []
                  ).length > 0 &&
                  !shared &&
                  t.deletedAt == null &&
                  t.completedOn === null,
          },
          {
            icon: 'history',
            name: 'history',
            action: (t: TaskOccurence): boolean =>
              !t ? true : t.completedOn !== null && t.deletedAt === null,
          },
          {
            icon: 'trash',
            name: 'trash',
            action: (t: TaskOccurence): boolean =>
              !t ? true : t.deletedAt != null,
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
              count: m.TaskOccurences.filter(
                (t: TaskOccurence) =>
                  t.deletedAt == null && t.completedOn == null
              ).length,
              isUser: true,
              handle: (tabs: SidebarTab[]) => handleSidebar(tabs),
              action: (t: TaskOccurence) =>
                (t.Users?.filter((uT: any) => uT.id === m.id).length ?? -1) >
                  0 &&
                t.deletedAt == null &&
                t.completedOn == null,
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

  const setSidebarCount = (newTasks?: Task[]) => {
    let newSidebarTabs = [...sidebarTabs];

    users.forEach((u) => {
      let sidebarTab = newSidebarTabs.find((st) => st.id === u.id);
      if (sidebarTab) {
        let count: number = 0;
        (newTasks ?? tasks).forEach((t) =>
          t.Occurences.forEach(
            (to) =>
              (count +=
                to.deletedAt == null &&
                to.completedOn == null &&
                (to.Users?.filter((tou: TaskUser) => tou.id === u.id).length ??
                  -1) > 0
                  ? 1
                  : 0)
          )
        );
        sidebarTab.count = count;
      }
    });
    setSidebarTabs(newSidebarTabs);
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

  const handleTask = (
    tab: SidebarTab,
    newTasks?: Task[],
    updateSidebar?: boolean
  ): void => {
    if (!newTasks) newTasks = [...tasks];

    let important =
      subHeaderTabs.find((ht) => ht.selected)?.name === 'important';

    newTasks.forEach((t) => {
      t.Occurences?.forEach((to) => {
        to.visible = false;

        if ((!important || (important && to.important)) && tab.action)
          to.visible =
            tab.value === 'private' ? tab.action(to, t.shared) : tab.action(to);
      });
    });
    setTasks(newTasks);
    if (updateSidebar === true) setSidebarCount(newTasks);
  };

  const getSelectedTab = (): SidebarTab =>
    sidebarTabs.find((t) => t.selected) ?? sidebarTabs[0];

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
    axios({
      method: task.id === -1 ? 'post' : 'put',
      url: `/tasks/${localStorage.getItem('currentHome')}/${
        task.id === -1 ? '' : task.id
      }`,
      data: {
        task,
      },
    })
      .then((res: any) => {
        let newTasks = [...tasks];
        if (task.id !== -1) {
          res.data.deletedIds.forEach((id) => {
            let taskOccIndex = -1;
            let taskIndex = newTasks.findIndex((t) => {
              if (t.Occurences) {
                taskOccIndex = t.Occurences?.findIndex((to) => to.id === id);
                return taskOccIndex !== -1;
              }
              return false;
            });

            if (taskIndex >= 0 && taskOccIndex >= 0)
              newTasks[taskIndex].Occurences.splice(taskOccIndex, 1);

            if (newTasks[taskIndex].Occurences.length === 0)
              newTasks.splice(taskIndex, 1);
          });

          res.data.task.Occurences.forEach((to) => (to.completedOn = null));

          let taskIndex = newTasks.findIndex((t) => t.id === res.data.task.id);
          if (taskIndex < 0) newTasks.push(res.data.task);
          else {
            newTasks[taskIndex].name = res.data.task.name;
            newTasks[taskIndex].repeat = res.data.task.repeat;
            newTasks[taskIndex].shared = res.data.task.shared;
            newTasks[taskIndex].untilDate = res.data.task.untilDate;
            newTasks[taskIndex].Occurences = newTasks[
              taskIndex
            ].Occurences.concat(res.data.task.Occurences);
          }
        } else newTasks.push(res.data.task);

        setPopup(nullJSX);
        handleTask(getSelectedTab(), newTasks, true);
        setSuccessNotification(res.data);
      })
      .catch((err) => {
        setNotification(err.response.data);
      });
  };

  const showPopup = (taskOccurence?: TaskOccurence): void => {
    setPopup(
      <EditPopup
        onCancel={() => setPopup(nullJSX)}
        taskOccurence={taskOccurence}
        users={users.map((u) => {
          return {
            id: u.id,
            value: `${u.firstname} ${u.lastname}`,
            img: u.Image?.url ?? undefined,
            icon:
              (u.Image?.url ?? undefined) === undefined
                ? 'user-circle'
                : undefined,
            selected: !taskOccurence
              ? false
              : (taskOccurence.Users?.find((tu) => tu.id === u.id) ?? null) !=
                null,
          } as DropdownMultiOption;
        })}
        onSubmit={(task: Task) => handleSubmit(task)}
        onDelete={
          taskOccurence ? (id: number) => deleteTask(id, true) : undefined
        }
      />
    );
  };

  const deleteTask = (id: number, closePopup?: boolean): void => {
    let newTasks = [...tasks];
    let taskOccIndex = -1;
    let taskIndex = newTasks.findIndex((t) => {
      if (t.Occurences) {
        taskOccIndex = t.Occurences?.findIndex((to) => to.id === id);
        return taskOccIndex !== -1;
      }
      return false;
    });
    if (taskIndex >= 0 && taskOccIndex >= 0) {
      axios
        .delete(`/tasks/${localStorage.getItem('currentHome')}/${id}`)
        .then((res: any) => {
          if (res.data.deletedAt == null)
            newTasks[taskIndex].Occurences.splice(taskOccIndex, 1);
          else
            newTasks[taskIndex].Occurences[taskOccIndex].deletedAt =
              res.data.deletedAt;

          if (closePopup) setPopup(nullJSX);
          handleTask(getSelectedTab(), newTasks, true);
        })
        .catch((err) => {
          setNotification(err.response.data);
        });
    }
  };

  const setCompletionTask = (id: number, done: boolean): void => {
    let newTasks = [...tasks];
    let taskOccIndex = -1;
    let taskIndex = newTasks.findIndex((t) => {
      if (t.Occurences) {
        taskOccIndex = t.Occurences?.findIndex((to) => to.id === id);
        return taskOccIndex !== -1;
      }
      return false;
    });

    if (taskIndex >= 0 && taskOccIndex >= 0) {
      axios
        .put(
          `/tasks/${localStorage.getItem('currentHome')}/${id}/${
            done ? 'do' : 'undo'
          }`
        )
        .then((res: any) => {
          newTasks[taskIndex].Occurences[taskOccIndex].completedOn =
            res.data.completedOn;

          handleTask(getSelectedTab(), newTasks, true);
        })
        .catch((err) => {
          setNotification(err.response.data);
        });
    }
  };

  const restoreTask = (task: TaskOccurence): void => {
    axios({
      method: 'put',
      url: `/tasks/${localStorage.getItem('currentHome')}/${task.id}/restore`,
    })
      .then((res: any) => {
        let newTasks = [...tasks];

        let taskOccIndex = -1;
        let taskIndex = newTasks.findIndex((t) => {
          if (t.Occurences) {
            taskOccIndex = t.Occurences?.findIndex((to) => to.id === task.id);
            return taskOccIndex !== -1;
          }
          return false;
        });

        if (taskIndex >= 0 && taskOccIndex >= 0)
          newTasks[taskIndex].Occurences[taskOccIndex].deletedAt = null;
        handleTask(getSelectedTab(), newTasks, true);
      })
      .catch((err) => {
        setNotification(err.response.data);
      });
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

  const getVisibleTaskOccurences = () => {
    let taskOccs: TaskOccurence[] = [];
    tasks.forEach((t) => {
      t.Occurences?.forEach((to) => {
        if (to.visible)
          taskOccs.push({ ...to, Task: { ...t, Occurences: [] } });
      });
    });

    return taskOccs.sort((a, b) =>
      new Date(a.dueDateTime) < new Date(b.dueDateTime) ? -1 : 1
    );
  };

  return (
    <AppContainer
      title={title}
      appName="tasks"
      subHeader={{
        tabs: subHeaderTabs,
        tabHandler: (tabs: SubHeaderTab[]) => setSubHeaderTabs(tabs),
      }}
      sidebar={sidebarTabs}
      popup={popup}
      onAddClick={() => showPopup(undefined)}
    >
      <div className="content">
        <List key={`task-list`} className="fill-height">
          {loaded ? (
            tasks?.filter(
              (t) => t.Occurences?.filter((to) => to.visible).length
            ).length > 0 ? (
              getVisibleTaskOccurences().map((to) => (
                <ListItem key={`task-${to.id}`} uid={to.id}>
                  <ListItemLeft>
                    <div className="generic-input">
                      <input
                        id="c2"
                        type="checkbox"
                        onClick={() =>
                          setCompletionTask(to.id, to.completedOn === null)
                        }
                        defaultChecked={to.completedOn !== null}
                      />
                    </div>
                    <h3>{to.Task?.name}</h3>
                    {to.important && (
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
                    {to.Users && (
                      <>
                        <div
                          className="involved-users"
                          id="involved-users-tasks"
                          style={to.Users.length < 5 ? { width: 'auto' } : {}}
                          onWheel={scrollHorizontal}
                        >
                          {to.Users.map((u) =>
                            u.Image?.url ? (
                              <img
                                key={`involved-${to.id}-${u.id}`}
                                src={`http://localhost:4000/images/public/${u.Image.url}`}
                                alt={`${u.firstname[0]}${u.lastname[0]}`.toUpperCase()}
                              />
                            ) : (
                              <div
                                key={`involved-${to.id}-${u.id}`}
                                className="user-initials"
                              >
                                {`${u.firstname[0].toUpperCase()}${u.lastname[0].toUpperCase()}`}
                              </div>
                            )
                          )}
                        </div>
                        <div
                          className={`tag ${
                            to.completedOn !== null
                              ? 'green'
                              : getTagColor(to.dueDateTime)
                          }`}
                        >
                          {getTranslatedMonthAndDay(to.dueDateTime)}
                        </div>
                      </>
                    )}

                    {getSelectedTab().value === 'trash' ? (
                      <IconToolTip
                        icon="trash-arrow-up"
                        style={iconStyle}
                        circled={{ value: true, multiplier: 0.45 }}
                        onClick={() => restoreTask(to)}
                      >
                        {ReactDOMServer.renderToStaticMarkup(
                          <Translate
                            name="restore"
                            prefix="actions."
                          ></Translate>
                        )}
                      </IconToolTip>
                    ) : (
                      <IconToolTip
                        icon="pen"
                        style={iconStyle}
                        circled={{ value: true, multiplier: 0.45 }}
                        onClick={() => showPopup(to)}
                      >
                        {ReactDOMServer.renderToStaticMarkup(
                          <Translate name="edit" prefix="actions."></Translate>
                        )}
                      </IconToolTip>
                    )}

                    <IconToolTip
                      icon="times-circle"
                      style={iconStyle}
                      error={true}
                      onClick={(e) => deleteTask(to.id)}
                    >
                      {ReactDOMServer.renderToStaticMarkup(
                        <Translate name="delete" prefix="actions."></Translate>
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
