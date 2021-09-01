import AppContainer from '../../components/app/appContainer';
import '../../assets/css/console.css';

export default function AppConsole() {
  return (
    <AppContainer title="console" appName="console">
      <div className="windows">
        <textarea className="window"></textarea>
      </div>
    </AppContainer>
  );
}
