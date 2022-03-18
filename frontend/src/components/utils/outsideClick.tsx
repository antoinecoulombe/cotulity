import { useEffect } from 'react';

export const useOutsideAlerter = (
  ref: any,
  callback: (...attr: any) => any
): void => {
  useEffect(() => {
    const handleClickOutside = (event: any): void => {
      let currentNotif = document.getElementsByClassName('notif-current');
      if (
        ref.current &&
        !ref.current.contains(event.target) &&
        !event.target.classList.contains('logout') &&
        (!currentNotif.length || !currentNotif[0].contains(event.target))
      )
        callback(event);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
};
