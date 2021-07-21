import React, { useState } from 'react';
import AppContainer from '../../components/app/appContainer';
import Translate from '../../components/utils/translate';
import '../../assets/css/settings.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

interface AppSettingsProps {
  setTheme(theme: string): void;
  theme: string;
}

export default function AppSettings(props: AppSettingsProps) {
  const [t, i18n] = useTranslation('common');

  function setLang(lang: string) {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  }

  function toggleTheme() {
    const theme = props.theme == 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    props.setTheme(theme);
  }

  return (
    <AppContainer title="settings" appName="settings">
      <div className="settings-container">
        <div className="theme">
          <h3>
            <Translate name="title" prefix="settings.theme." />
            <div className="input-toggle">
              <ul>
                <li>
                  <label htmlFor="s2">
                    <Translate name="dark" prefix="settings.theme." />
                  </label>
                  {props.theme == 'light' ? (
                    <input
                      id="s2"
                      type="checkbox"
                      className="switch"
                      defaultChecked
                      onClick={toggleTheme}
                    />
                  ) : (
                    <input
                      id="s2"
                      type="checkbox"
                      className="switch"
                      onClick={toggleTheme}
                    />
                  )}
                  <label>
                    <Translate name="light" prefix="settings.theme." />
                  </label>
                </li>
              </ul>
            </div>
          </h3>
          <div></div>
        </div>
        <div className="lang">
          <h3>
            <Translate name="language" prefix="settings." />
          </h3>
          <h2 onClick={() => setLang('fr')}>FR</h2>
          <h2 onClick={() => setLang('en')}>EN</h2>
        </div>
        <div className="picture">
          <button>
            <FontAwesomeIcon icon="upload" />
            <Translate name="changePicture" prefix="settings." />
          </button>
          {/* <img src=""/> */}
        </div>
        <div className="delete-account">
          <button className="yes">
            <FontAwesomeIcon icon="trash" />
            <Translate name="deleteAccount" prefix="settings." />
          </button>
        </div>
      </div>
    </AppContainer>
  );
}
