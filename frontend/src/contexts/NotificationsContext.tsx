import * as React from 'react';
import axios from '../fetchClient';

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
  setNotification: (notification: jsonNotification | jsonNotification[]) =>
    null,
  clearNotification: (id: number) => null,
};

export type NotificationsContextValue = typeof defaultApi;

export const NotificationsContext =
  React.createContext<NotificationsContextValue>(defaultApi);

export function NotificationsProvider({ children }: any) {
  // Notifications queue is managed in local useState
  const [notifications, setNotifications] = React.useState<
    strictJsonNotification[]
  >(defaultApi.notifications);

  // Method to push a new notification
  const setNotification = React.useCallback(
    (newNotifications: jsonNotification | jsonNotification[]) => {
      try {
        console.log('SETNOTIF');
        if (!Array.isArray(notifications))
          newNotifications = [newNotifications as jsonNotification];

        let newFilteredNotifications: strictJsonNotification[] = [];
        (newNotifications as jsonNotification[]).forEach((n) => {
          newFilteredNotifications.push({
            id: n.id ?? new Date().getTime(),
            db: n.db ?? false,
            title: n.title,
            msg: n.msg,
            type: { name: n.type?.name, showTime: n.type?.showTime ?? 5 },
          } as strictJsonNotification);
        });

        console.log(newFilteredNotifications);
        setNotifications(notifications.concat(newFilteredNotifications));
      } catch (error) {
        console.log(error);
      }
      return null;
    },
    [notifications, setNotifications]
  );

  // Method to clear a notification
  const clearNotification = React.useCallback(
    (id: number) => {
      const nextNotifications = notifications.filter((n) => n.id !== id);

      const toDelete = notifications.find((n) => n.id === id);
      if (toDelete?.db) {
        axios
          .post(`/notifications/delete/${id}`)
          .then((res) => res.data)
          .catch((err) => Promise.reject(err));
      }

      setNotifications(nextNotifications);
      return null;
    },
    [notifications, setNotifications]
  );

  // Return Provider with full API
  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        setNotification,
        clearNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

// Connvenience import hook
export function useNotifications() {
  return React.useContext(NotificationsContext);
}
