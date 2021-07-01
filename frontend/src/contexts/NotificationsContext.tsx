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
  notifications: [] as strictJsonNotification[],
  setNotification: (notification: jsonNotification) => null,
  setNotificationArray: (notifications: jsonNotification[]) => null,
  clearNotification: (id: number) => null,
  clearAllNotifications: () => null,
};

export type NotificationsContextValue = typeof defaultApi;

export const NotificationsContext =
  React.createContext<NotificationsContextValue>(defaultApi);

export function NotificationsProvider({ children }: any) {
  const [notifications, setNotifications] = React.useState<
    strictJsonNotification[]
  >(defaultApi.notifications);

  // Convert a jsonNotification to a strictJsonNotificaiton.
  function toStrict(n: jsonNotification): strictJsonNotification {
    console.log(n);
    return {
      id: n.id ?? new Date().getTime(),
      db: n.db ?? false,
      title: n.title,
      msg: n.msg,
      type: { name: n.type?.name ?? 'error', showTime: n.type?.showTime ?? 5 },
    };
  }

  // Append an array of notifications at the end of the notification array.
  const setNotificationArray = React.useCallback(
    (newNotifications: jsonNotification[]) => {
      try {
        let newFilteredNotifications: strictJsonNotification[] = [];
        newNotifications.forEach((n) => {
          newFilteredNotifications.push(toStrict(n));
        });

        setNotifications(notifications.concat(newFilteredNotifications));
      } catch (error) {
        console.log(error);
      }
      return null;
    },
    [notifications, setNotifications]
  );

  // Add a new notification at the end of the notification array.
  const setNotification = React.useCallback(
    (newNotification: jsonNotification) => {
      try {
        setNotifications(notifications.concat(toStrict(newNotification)));
      } catch (error) {
        console.log(error);
      }
      return null;
    },
    [notifications, setNotifications]
  );

  // Delete a notification from 'id', and delete it from database if needed.
  const clearNotification = React.useCallback(
    (id: number) => {
      const nextNotifications = notifications.filter((n) => n.id !== id);

      // TODO: uncomment this to delete from database
      // const toDelete = notifications.find((n) => n.id === id);
      // if (toDelete?.db) {
      //   axios
      //     .delete(`/notifications/delete/${id}`)
      //     .then((res) => res.data)
      //     .catch();
      // }

      setNotifications(nextNotifications);
      return null;
    },
    [notifications, setNotifications]
  );

  // Delete all notifications. Does not delete from database.
  const clearAllNotifications = React.useCallback(() => {
    setNotifications([]);
    return null;
  }, [notifications, setNotifications]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        setNotification,
        setNotificationArray,
        clearNotification,
        clearAllNotifications,
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
