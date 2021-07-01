import * as React from 'react';
import axios from '../utils/fetchClient';

export interface jsonNotification {
  id?: number;
  db?: boolean;
  title: string;
  msg: string;
  type?: {
    name: string;
    showTime?: number;
  };
}

export interface strictJsonNotification {
  id: number;
  db: boolean;
  title: string;
  msg: string;
  type: {
    name: string;
    showTime: number;
  };
}

const defaultApi = {
  current: 0 as number,
  notifications: [] as strictJsonNotification[],
  setNotification: (notification: jsonNotification) => null,
  setNotificationArray: (notifications: jsonNotification[]) => null,
  clearNotification: (id: number) => null,
  clearAllNotifications: () => null,
  prevNotification: () => null,
  nextNotification: () => null,
};

export type NotificationsContextValue = typeof defaultApi;

export const NotificationsContext =
  React.createContext<NotificationsContextValue>(defaultApi);

export function NotificationsProvider({ children }: any) {
  const [current, setCurrentNotification] = React.useState(defaultApi.current);
  const [notifications, setNotifications] = React.useState<
    strictJsonNotification[]
  >(defaultApi.notifications);

  // Convert a jsonNotification to a strictJsonNotificaiton.
  function toStrict(n: jsonNotification): strictJsonNotification {
    return {
      id: n.id ?? new Date().getTime(),
      db: n.db ?? false,
      title: n.title,
      msg: n.msg,
      type: { name: n.type?.name ?? 'error', showTime: n.type?.showTime ?? 5 },
    };
  }

  const prevNotification = React.useCallback(() => {
    console.log(
      `decrement: ${current} - notif.length = ${notifications.length}`
    );
    if (current > 0) setCurrentNotification(current - 1);
    return null;
  }, [notifications, setNotifications, current, setCurrentNotification]);

  const nextNotification = React.useCallback(() => {
    console.log(
      `increment: ${current} - notif.length = ${notifications.length}`
    );
    if (current < notifications.length - 1) setCurrentNotification(current + 1);
    return null;
  }, [notifications, setNotifications, current, setCurrentNotification]);

  // Append an array of notifications at the end of the notification array.
  const setNotificationArray = React.useCallback(
    (newNotifications: jsonNotification[]) => {
      let newFilteredNotifications: strictJsonNotification[] = [];
      newNotifications.forEach((n) =>
        newFilteredNotifications.push(toStrict(n))
      );

      setNotifications(notifications.concat(newFilteredNotifications));
      return null;
    },
    [notifications, setNotifications]
  );

  // Add a new notification at the end of the notification array.
  const setNotification = React.useCallback(
    (newNotification: jsonNotification) => {
      setNotifications(notifications.concat(toStrict(newNotification)));
      return null;
    },
    [notifications, setNotifications]
  );

  // Delete a notification from 'id', and delete it from database if needed.
  const clearNotification = React.useCallback(
    (id: number) => {
      console.log(`notif.length = ${notifications.length}`);
      let notification = notifications.find((n) => n.id === id);
      if (!notification) return null;

      // TODO: uncomment this to delete from database
      // if (notification?.db) {
      //   axios
      //     .delete(`/notifications/delete/${id}`)
      //     .then((res) => res.data)
      //     .catch();
      // }

      setNotifications(notifications.filter((n) => n.id !== id));

      if (notifications.findIndex((n) => n.id === id) <= current)
        setCurrentNotification(current === 0 ? current : current - 1);

      return null;
    },
    [notifications, setNotifications, current, setCurrentNotification]
  );

  // Delete all notifications, previous and current. Does not delete from database.
  const clearAllNotifications = React.useCallback(() => {
    setCurrentNotification(0);
    setNotifications([]);
    return null;
  }, [notifications, setNotifications, current, setCurrentNotification]);

  return (
    <NotificationsContext.Provider
      value={{
        current,
        notifications,
        setNotification,
        setNotificationArray,
        clearNotification,
        clearAllNotifications,
        prevNotification,
        nextNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

// Notification hook
export function useNotifications() {
  return React.useContext(NotificationsContext);
}
