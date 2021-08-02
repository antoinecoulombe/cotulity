import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';
import AppContainer from '../../components/app/appContainer';
import Translate from '../../components/utils/translate';
import $ from 'jquery';
import WarningPopup from '../../components/global/warningPopup';
import axios from '../../utils/fetchClient';

import '../../assets/css/settings.css';
import { useNotifications } from '../../contexts/NotificationsContext';
import IconToolTip from '../../components/global/iconTooltip';
import { useHistory } from 'react-router';

interface AppSettingsProps {
  setTheme(theme: string): void;
  theme: string;
}

const nullJSX: JSX.Element = <></>;

export default function AppSettings(props: AppSettingsProps) {
  const {
    setErrorNotification,
    setSuccessNotification,
    clearAllNotifications,
  } = useNotifications();
  const history = useHistory();
  const [t, i18n] = useTranslation('common');
  const [popup, setPopup] = useState<JSX.Element>(nullJSX);
  const [file, setFile] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    axios
      .get(`/images/profile`)
      .then((res) => {
        setProfilePicture(res.data.url);
      })
      .catch((err) => {});
  }, []);

  function setLang(lang: string) {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  }

  function setTheme(theme: string) {
    if (theme == localStorage.getItem('theme')) return;
    $('#theme-switch').trigger('click');
    localStorage.setItem('theme', theme);
    props.setTheme(theme);
  }

  function toggleTheme() {
    const theme = props.theme == 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    props.setTheme(theme);
  }

  function showWarningPopup() {
    setPopup(
      <WarningPopup
        title="settings.account.delete.title"
        yesText="settings.account.delete.buttons.yes"
        noText="settings.account.delete.buttons.no"
        onCancel={() => setPopup(nullJSX)}
        onSubmit={deleteAccount}
      ></WarningPopup>
    );
  }

  function deleteAccount() {
    axios
      .delete('/users/delete')
      .then((res) => {
        localStorage.clear();
        clearAllNotifications();
        history.push('/');
        setSuccessNotification(res.data);
      })
      .catch((err) => {
        setErrorNotification(err.response.data);
      });
  }

  function deleteProfilePicture() {
    axios
      .delete('users/image/delete')
      .then((res) => {
        setFile(null);
        setProfilePicture(null);
        setSuccessNotification(res.data);
      })
      .catch((err) => {
        setErrorNotification(err.response.data);
      });
  }

  function onFileChange(event: any, action: string) {
    let formData = new FormData();
    formData.append('file', event.target.files[0]);

    axios
      .put(`/users/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        setFile(event.target.files[0]);
        $('#img-profile').attr(
          'src',
          URL.createObjectURL(event.target.files[0])
        );
        setSuccessNotification(res.data);
      })
      .catch((err) => {
        setErrorNotification(err.response.data);
      });
  }

  return (
    <AppContainer title="settings" appName="settings" popup={popup}>
      <div className="settings-container">
        <div className="setting">
          <div className="left">
            <h2>
              <Translate name="title" prefix="settings.theme." />
            </h2>
          </div>
          <div className="right">
            <h3
              onClick={() => setTheme('light')}
              className={
                localStorage.getItem('theme') == 'light' ? 'active' : ''
              }
            >
              <Translate name="light" prefix="settings.theme." />
            </h3>
            <div className="input-toggle">
              <div className="generic-input">
                {props.theme == 'light' ? (
                  <input
                    id="theme-switch"
                    type="checkbox"
                    className="switch"
                    defaultChecked
                    onClick={toggleTheme}
                  />
                ) : (
                  <input
                    id="theme-switch"
                    type="checkbox"
                    className="switch"
                    onClick={toggleTheme}
                  />
                )}
              </div>
            </div>
            <h3
              onClick={() => setTheme('dark')}
              className={
                localStorage.getItem('theme') == 'dark' ? 'active' : ''
              }
            >
              <Translate name="dark" prefix="settings.theme." />
            </h3>
          </div>
        </div>
        <div className="setting">
          <div className="left">
            <h2>
              <Translate name="language" prefix="settings." />
            </h2>
          </div>
          <div className="right">
            {['fr', 'en'].map((lang, i) => (
              <h3
                key={i}
                onClick={() => setLang(lang)}
                className={localStorage.getItem('lang') == lang ? 'active' : ''}
              >
                {lang.toUpperCase()}
              </h3>
            ))}
          </div>
        </div>
        <div className="setting picture">
          <input
            id="img-upload-profile"
            type="file"
            style={{ display: 'none' }}
            onChange={(e) => onFileChange(e, 'profile')}
          />
          <button onClick={() => $('#img-upload-profile').trigger('click')}>
            <FontAwesomeIcon icon="upload" />
            <Translate name="changePicture" prefix="settings." />
          </button>
          {file || profilePicture ? (
            <div className="img-profile-container">
              <IconToolTip
                icon="trash"
                circled={{ value: true, multiplier: 0.45 }}
                style={{ iconWidth: 40, tooltipMultiplier: 5 }}
                error={true}
                className="overlay-delete"
                onClick={deleteProfilePicture}
              >
                nav.delete
              </IconToolTip>
              {file ? (
                <img id="img-profile" />
              ) : (
                <img
                  id="img-profile"
                  src={`http://localhost:3000/images/public/${profilePicture}`}
                />
              )}
            </div>
          ) : (
            <FontAwesomeIcon icon="user-circle" />
          )}
        </div>
        <div className="setting centered delete">
          <button className="yes" onClick={showWarningPopup}>
            <FontAwesomeIcon icon="trash" />
            <Translate name="deleteAccount" prefix="settings." />
          </button>
        </div>
      </div>
    </AppContainer>
  );
}
