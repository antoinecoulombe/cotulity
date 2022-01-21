import { useEffect, useState } from 'react';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useHistory, useParams } from 'react-router';
import { Home } from './homes';
import App from '../../components/apps/app';
import axios from '../../utils/fetchClient';
import HomesDropdown from '../../components/apps/homesDropdown';
import $ from 'jquery';
import '../../assets/css/apps.css';

interface OnlineApp {
  id: number;
  priority: number;
  name: string;
  image: string;
  imageMultiplier: number;
  description?: string;
}

export default function AppsPage() {
  const { setNotification, setSuccessNotification } = useNotifications();
  const [apps, setApps] = useState<OnlineApp[]>([]);
  const [homes, setHomes] = useState<Home[]>([]);
  const history = useHistory();

  let { token } = useParams<{ token: string }>();

  if (!localStorage.getItem('lang')) localStorage.setItem('lang', 'en');
  if (!localStorage.getItem('theme')) localStorage.setItem('theme', 'light');

  function setHome(home: Home | undefined, homes: Home[], reorder?: boolean) {
    if (!home) return;
    localStorage.setItem('currentHome', home.refNumber.toString());

    const newHomes = [...homes];
    if (reorder) {
      const i = homes.findIndex((h) => h.refNumber === home.refNumber);
      newHomes.unshift(newHomes.splice(i, 1)[0]);
    }
    setHomes(newHomes);
  }

  function handleHomeChange(homes: Home[]) {
    setHome(homes[0], homes);
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

  async function getHomes() {
    axios
      .get(`/homes/accepted`)
      .then((res: any) => {
        if (!res.data.homes || !res.data.homes.length)
          history.push('/apps/homes/new');

        if (!localStorage.getItem('currentHome'))
          setHome(res.data.homes[0], res.data.homes);
        else
          setHome(
            res.data.homes.find(
              (h: Home) =>
                h.refNumber.toString() === localStorage.getItem('currentHome')
            ),
            res.data.homes,
            true
          );
      })
      .catch((err) => {
        setNotification(err.response.data);
      });
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    axios
      .get(`/apps`)
      .then(async (res: any) => {
        setApps(res.data.apps);

        if (token) {
          return axios
            .put(`/homes/invitations/${token}/accept`)
            .then((res) => {
              setSuccessNotification(res.data);
              history.push('/apps');
            })
            .catch((err) => {
              setNotification(err.response.data);
              getHomes();
            });
        } else getHomes();
      })
      .catch((err) => {
        setNotification(err.response.data);
      });
  }, []);

  useEffect(() => {
    handleResize();
  }, [apps, homes]);

  return homes.length ? (
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
  ) : (
    <></>
  );
}
