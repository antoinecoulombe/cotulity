import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import '../assets/css/apps.css';
import App from '../components/apps/app';
import axios from '../utils/fetchClient';
import { useNotifications } from '../contexts/NotificationsContext';
import { useHistory } from 'react-router';
import HomesDropdown from '../components/apps/homesDropdown';
import { Home } from './apps/homes';

interface OnlineApp {
  id: number;
  name: string;
  image: string;
  description?: string;
}

export default function AppsPage() {
  const { setNotification } = useNotifications();
  const [apps, setApps] = useState<OnlineApp[]>([]);
  const [homes, setHomes] = useState<Home[]>([]);
  const [currentHome, setCurrentHome] = useState<Home>();
  const history = useHistory();

  function handleHomeChange(home: Home[]) {
    setHomes(home);
    setCurrentHome(home[0]);
  }

  function handleResize() {
    let containerWidth = $('#apps-container').outerWidth() ?? 500,
      appWidth = $('.app-container').outerWidth(true) ?? 500,
      appsPerLine = Math.floor(containerWidth / appWidth);

    if (appsPerLine > $('.app-container').length)
      appsPerLine = $('.app-container').length;

    $('#apps').css({
      width: appWidth * appsPerLine,
    });
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    axios
      .get(`/apps`)
      .then(async (res: any) => {
        setApps(res.data.apps);
        handleResize();

        axios
          .get(`/homes`)
          .then((res: any) => {
            if (!res.data.homes || res.data.homes.length === 0)
              history.push('/apps/homes/new');

            setHomes(res.data.homes);
            setCurrentHome(res.data.homes[0]);
          })
          .catch((err) => {
            setNotification(err.response.data);
          });
      })
      .catch((err) => {
        setNotification(err.response.data);
      });
  }, []);

  return (
    <>
      <div id="apps-container">
        <HomesDropdown
          homes={homes}
          onChange={handleHomeChange}
        ></HomesDropdown>
        <div id="apps">
          {apps.map((app) => (
            <App
              icon={app.image}
              id={app.id}
              name={app.name}
              key={app.id}
            ></App>
          ))}
        </div>
      </div>
    </>
  );
}
