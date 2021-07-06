import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import '../assets/css/apps.css';
import App from '../components/apps/app';
import axios from '../utils/fetchClient';
import { useNotifications } from '../contexts/NotificationsContext';
import { useHistory } from 'react-router';

interface OnlineApp {
  id: number;
  name: string;
  image: string;
  description?: string;
}

interface UserHome {
  id: number;
  name: string;
  refNumber: string;
}

export default function AppsPage() {
  const { setNotification } = useNotifications();
  const [apps, setApps] = useState<OnlineApp[]>([]);
  const [homes, setHomes] = useState<UserHome[]>([]);
  const [currentHome, setCurrentHome] = useState<UserHome>();
  const history = useHistory();

  function handleResize() {
    let containerWidth = $('#apps-container').outerWidth() ?? 500,
      appWidth = $('.app-container').outerWidth(true) ?? 500,
      appsPerLine = Math.floor(containerWidth / appWidth);

    if (appsPerLine > $('.app-container').length)
      appsPerLine = $('.app-container').length;

    $('#apps').css({
      width: appWidth * appsPerLine,
      left: (containerWidth - appWidth * appsPerLine) / 2,
    });
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    axios
      .get(`/homes`)
      .then(async (res: any) => {
        if (!res.data.homes || res.data.homes.length === 0)
          history.push('/apps/homes/new');

        setHomes(res.data.homes);
        setCurrentHome(res.data.homes[0]);
      })
      .catch((err) => {
        setNotification(err.response.data);
      });

    axios
      .get(`/apps`)
      .then(async (res: any) => {
        setApps(res.data.apps);
        handleResize();
      })
      .catch((err) => {
        setNotification(err.response.data);
      });
  }, []);

  return (
    <>
      <div id="homes-list">
        {homes.map((home) => (
          <div key={home.id}>
            <h1>{home.name}</h1>
          </div>
        ))}
      </div>
      <div id="apps-container">
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
