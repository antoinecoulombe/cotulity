import * as React from 'react';
import axios from '../utils/fetchClient';
import { useInterval } from '../utils/interval';

const timeoutCallbackDelay = 1; // Delay before triggering notification deletion

export const notificationTypes = {
  error: { name: 'error', timeout: 5 },
  warning: { name: 'warning', timeout: 3 },
  info: { name: 'info', timeout: 3 },
  success: { name: 'success', timeout: 2 },
};

export interface jsonNotification {
  id?: number;
  db?: boolean;
  title: string;
  msg: string;
  type?: {
    name: string;
    timeout?: number;
  };
  timestamp?: number;
}

export interface strictJsonNotification {
  id: number;
  db: boolean;
  title: string;
  msg: string;
  type: {
    name: string;
    timeout: number;
  };
  timestamp: number | null;
}

const defaultApi = {
  currentNotification: 0 as number,
  notifications: [] as strictJsonNotification[],
  setNotificationArray: (notifications: jsonNotification[]) => null,
  setNotification: (notification: jsonNotification) => null,
  setErrorNotification: (notification: jsonNotification) => null,
  setSuccessNotification: (notification: jsonNotification) => null,
  setWarningNotification: (notification: jsonNotification) => null,
  setInfoNotification: (notification: jsonNotification) => null,
  clearNotification: () => null,
  clearAllNotifications: () => null,
  prevNotification: () => null,
  nextNotification: () => null,
};

export type NotificationsContextValue = typeof defaultApi;

export const NotificationsContext =
  React.createContext<NotificationsContextValue>(defaultApi);

export function NotificationsProvider({ children }: any) {
  const [currentNotification, setCurrentNotification] = React.useState<number>(
    defaultApi.currentNotification
  );
  const [notifications, setNotifications] = React.useState<
    strictJsonNotification[]
  >(defaultApi.notifications);

  // Convert a jsonNotification to a strictJsonNotificaiton.
  function toStrict(
    n: jsonNotification,
    type?: { name: string; timeout: number }
  ): strictJsonNotification {
    return {
      id: n.id ?? new Date().getTime(),
      db: n.db ?? false,
      title: n.title,
      msg: n.msg,
      type: type ?? {
        name: n.type?.name ?? notificationTypes.error.name,
        timeout: n.type?.timeout ?? notificationTypes.info.timeout,
      },
      timestamp: null,
    };
  }

  function setCurrent(current: number) {
    setCurrentNotification(current);
    setNotifications(resetTimestamps(notifications, current));
  }

  const prevNotification = React.useCallback(() => {
    if (currentNotification > 0) setCurrent(currentNotification - 1);
    return null;
  }, [setCurrent, currentNotification]);

  const nextNotification = React.useCallback(() => {
    if (currentNotification < notifications.length - 1)
      setCurrent(currentNotification + 1);
    return null;
  }, [notifications, setCurrent, currentNotification]);

  function resetTimestamps(
    notifs: strictJsonNotification[],
    current?: number
  ): strictJsonNotification[] {
    if (notifs && notifs.length > 0) {
      notifs.forEach((n) => (n.timestamp = null));
      notifs[current ?? currentNotification].timestamp = Date.now();
    }
    return notifs;
  }

  // Append an array of notifications at the end of the notification array.
  const setNotificationArray = React.useCallback(
    (newNotifications: jsonNotification[]) => {
      let newFilteredNotifications: strictJsonNotification[] = [];
      newNotifications.forEach((n) =>
        newFilteredNotifications.push(toStrict(n))
      );

      if (notifications.length)
        setNotifications(notifications.concat(newFilteredNotifications));
      else setNotifications(resetTimestamps(newFilteredNotifications));

      return null;
    },
    [notifications, setNotifications]
  );

  const setErrorNotification = React.useCallback(
    (newNotification: jsonNotification) => {
      setNotifications(
        notifications.concat(toStrict(newNotification, notificationTypes.error))
      );
      return null;
    },
    [notifications, setNotifications]
  );

  const setWarningNotification = React.useCallback(
    (newNotification: jsonNotification) => {
      setNotifications(
        notifications.concat(
          toStrict(newNotification, notificationTypes.warning)
        )
      );
      return null;
    },
    [notifications, setNotifications]
  );

  const setInfoNotification = React.useCallback(
    (newNotification: jsonNotification) => {
      setNotifications(
        notifications.concat(toStrict(newNotification, notificationTypes.info))
      );
      return null;
    },
    [notifications, setNotifications]
  );

  const setSuccessNotification = React.useCallback(
    (newNotification: jsonNotification) => {
      setNotifications(
        notifications.concat(
          toStrict(newNotification, notificationTypes.success)
        )
      );
      return null;
    },
    [notifications, setNotifications]
  );

  // Add a new notification at the end of the notification array.
  const setNotification = React.useCallback(
    (newNotification: jsonNotification) => {
      if (notifications.length)
        setNotifications(notifications.concat(toStrict(newNotification)));
      else setNotifications(resetTimestamps([toStrict(newNotification)]));
      return null;
    },
    [notifications, setNotifications]
  );

  // Delete a notification from 'id', and delete it from database if needed.
  const clearNotification = React.useCallback(() => {
    let notification = notifications[currentNotification];
    if (notification?.db) {
      axios
        .delete(`/notifications/delete/${notification.id}`)
        .then((res) => res.data)
        .catch();
    }

    let current = currentNotification;
    if (currentNotification != 0) --current;

    var newNotifications = resetTimestamps(
      notifications
        .slice(0, currentNotification)
        .concat(notifications.splice(currentNotification + 1)),
      current
    );

    setCurrentNotification(current);
    setNotifications(newNotifications);

    return null;
  }, [notifications, setNotifications, currentNotification, setCurrent]);

  // Delete a notification from 'id', and delete it from database if needed.
  const clearAllNotifications = React.useCallback(() => {
    setNotifications([]);
    setCurrentNotification(0);
    return null;
  }, [setNotifications, setCurrentNotification]);

  // #region Notification deletion

  const handleTimeout = React.useCallback(() => {
    if (notifications.length > 0) {
      let notification = notifications[currentNotification];

      if (
        notification.timestamp !== null &&
        notification.timestamp + notification.type.timeout * 1000 < Date.now()
      )
        clearNotification();
    }
  }, [notifications, clearNotification]);

  useInterval(handleTimeout, timeoutCallbackDelay * 1000);

  // #endregion

  return (
    <NotificationsContext.Provider
      value={{
        currentNotification,
        notifications,
        setNotification,
        setErrorNotification,
        setWarningNotification,
        setSuccessNotification,
        setInfoNotification,
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
