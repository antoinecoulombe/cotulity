import Translate from '../../components/utils/translate';
import $ from 'jquery';

interface SetThemeProps {
  setTheme(theme: string): void;
  theme: string;
}

export default function SetTheme(props: SetThemeProps) {
  function setTheme(theme: string, click: boolean) {
    if (theme == localStorage.getItem('theme')) return;
    if (click) $('#theme-switch').trigger('click');
    localStorage.setItem('theme', theme);
    props.setTheme(theme);
  }

  function toggleTheme() {
    const theme = localStorage.getItem('theme') == 'light' ? 'dark' : 'light';
    setTheme(theme, false);
  }

  return (
    <div className="setting">
      <div className="left">
        <h2>
          <Translate name="title" prefix="settings.theme." />
        </h2>
      </div>
      <div className="right">
        <h3
          onClick={() => setTheme('light', true)}
          className={localStorage.getItem('theme') == 'light' ? 'active' : ''}
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
          onClick={() => setTheme('dark', true)}
          className={localStorage.getItem('theme') == 'dark' ? 'active' : ''}
        >
          <Translate name="dark" prefix="settings.theme." />
        </h3>
      </div>
    </div>
  );
}
