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
  current?: boolean;
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
  current: boolean;
}

const defaultApi = {
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

export const NotificationsProvider = ({ children }: any): JSX.Element => {
  const [notifications, setNotifications] = React.useState<
    strictJsonNotification[]
  >(defaultApi.notifications);

  // Convert a jsonNotification to a strictJsonNotificaiton.
  const toStrict = (
    n: jsonNotification,
    type?: { name: string; timeout: number }
  ): strictJsonNotification => {
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
      current: false,
    };
  };

  const getCurrentNotificationIndex = (): number => {
    if (!notifications || !notifications.length) return -1;

    let i = notifications.findIndex((n) => n.current);
    return i == -1 ? 0 : i;
  };

  const getCurrentNotification = (): strictJsonNotification | undefined => {
    if (!notifications || !notifications.length) return undefined;
    return notifications.find((n) => n.current);
  };

  const setCurrentNotification = (
    current: number,
    notifs?: strictJsonNotification[]
  ): void => {
    let newNotifications = notifs ? [...notifs] : [...notifications];

    if (newNotifications?.length) {
      newNotifications.forEach((n) => {
        n.timestamp = null;
        n.current = false;
      });

      newNotifications[current].current = true;
      newNotifications[current].timestamp = Date.now();
    }

    setNotifications(newNotifications);
  };

  const appendOrSetNotifications = (notifs: strictJsonNotification[]) => {
    if (notifications && notifications.length)
      setNotifications([...notifications].concat(notifs));
    else setCurrentNotification(0, notifs);
  };

  const prevNotification = React.useCallback(() => {
    if (getCurrentNotificationIndex() > 0)
      setCurrentNotification(getCurrentNotificationIndex() - 1);
    return null;
  }, [setCurrentNotification]);

  const nextNotification = React.useCallback(() => {
    if (getCurrentNotificationIndex() < notifications.length - 1)
      setCurrentNotification(getCurrentNotificationIndex() + 1);
    return null;
  }, [notifications, setCurrentNotification]);

  // Append an array of notifications at the end of the notification array.
  const setNotificationArray = React.useCallback(
    (newNotifications: jsonNotification[]) => {
      let strictNotifications: strictJsonNotification[] = [];
      newNotifications.forEach((n) => strictNotifications.push(toStrict(n)));

      appendOrSetNotifications(strictNotifications);
      return null;
    },
    [notifications, setNotifications]
  );

  const setErrorNotification = React.useCallback(
    (newNotification: jsonNotification) => {
      appendOrSetNotifications([
        toStrict(newNotification, notificationTypes.error),
      ]);
      return null;
    },
    [notifications, setNotifications]
  );

  const setWarningNotification = React.useCallback(
    (newNotification: jsonNotification) => {
      appendOrSetNotifications([
        toStrict(newNotification, notificationTypes.warning),
      ]);
      return null;
    },
    [notifications, setNotifications]
  );

  const setInfoNotification = React.useCallback(
    (newNotification: jsonNotification) => {
      appendOrSetNotifications([
        toStrict(newNotification, notificationTypes.info),
      ]);
      return null;
    },
    [notifications, setNotifications]
  );

  const setSuccessNotification = React.useCallback(
    (newNotification: jsonNotification) => {
      appendOrSetNotifications([
        toStrict(newNotification, notificationTypes.success),
      ]);
      return null;
    },
    [notifications, setNotifications]
  );

  // Add a new notification at the end of the notification array.
  const setNotification = React.useCallback(
    (newNotification: jsonNotification) => {
      appendOrSetNotifications([toStrict(newNotification)]);
      return null;
    },
    [notifications, setNotifications]
  );

  // Delete a notification from 'id', and delete it from database if needed.
  const clearNotification = React.useCallback(() => {
    let notification = getCurrentNotification();
    if (!notification) return null;
    if (notification.db) {
      axios
        .delete(`/notifications/delete/${notification.id}`)
        .then((res) => res.data)
        .catch();
    }

    let current = getCurrentNotificationIndex();
    if (current != 0) --current;

    setCurrentNotification(
      current,
      notifications
        .slice(0, getCurrentNotificationIndex())
        .concat([...notifications].splice(getCurrentNotificationIndex() + 1))
    );

    return null;
  }, [notifications, setNotifications]);

  // Delete a notification from 'id', and delete it from database if needed.
  const clearAllNotifications = React.useCallback(() => {
    setNotifications([]);
    setCurrentNotification(0);
    return null;
  }, [setNotifications, setCurrentNotification]);

  // #region Notification deletion

  const handleTimeout = React.useCallback(() => {
    if (notifications && notifications.length) {
      let notification = getCurrentNotification();
      if (!notification) return;

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
};

// Notification hook
export const useNotifications = () => {
  return React.useContext(NotificationsContext);
};
