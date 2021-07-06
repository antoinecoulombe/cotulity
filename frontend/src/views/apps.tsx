import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import '../assets/css/apps.css';
import App from '../components/apps/app';
import axios from '../utils/fetchClient';
import { useNotifications } from '../contexts/NotificationsContext';

interface Apps {
  id: number;
  name: string;
  image: string;
  description?: string;
}

export default function AppsPage() {
  const { setNotification } = useNotifications();
  const [apps, setApps] = useState<Apps[]>([]);

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
    <div id="apps-container">
      <div id="apps">
        {apps.map((app) => (
          <App icon={app.image} id={app.id} name={app.name} key={app.id}></App>
        ))}
      </div>
    </div>
  );
}
