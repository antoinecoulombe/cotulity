import { useState } from 'react';
import AppContainer from '../../components/app/appContainer';
import SetLanguage from '../../components/settings/setLanguage';
import SetTheme from '../../components/settings/setTheme';
import SetSafeDelete from '../../components/settings/setSafeDelete';
import SetProfilePicture from '../../components/settings/setProfilePicture';
import DeleteAccount from '../../components/settings/deleteAccount';
import '../../assets/css/settings.css';

interface AppSettingsProps {
  setTheme(theme: string): void;
  theme: string;
}

export default function AppSettings(props: AppSettingsProps) {
  const [popup, setPopup] = useState<JSX.Element>(<></>);

  return (
    <AppContainer title="settings" appName="settings" popup={popup}>
      <div className="settings-container">
        <SetTheme setTheme={props.setTheme} theme={props.theme} />
        <SetSafeDelete />
        <SetLanguage />
        <SetProfilePicture />
        <DeleteAccount setPopup={setPopup} />
      </div>
    </AppContainer>
  );
}
