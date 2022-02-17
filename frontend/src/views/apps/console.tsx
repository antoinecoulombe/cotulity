import { useState } from 'react';
import AppContainer from '../../components/app/appContainer';
import '../../assets/css/apps/console.css';

const AppConsole = (): JSX.Element => {
  const [history, setHistory] = useState<Array<string>>([]);
  const [currentLine, setCurrentLineState] = useState<number>(-1);
  const [text, setText] = useState<string>('> ');

  const getLastLine = (): string => {
    return text.substr(text.lastIndexOf('\n') + 3);
  };

  const handleCommand = (event: any): void => {
    const newLine = '\n> ';
    history.push(getLastLine());
    setText(text + newLine);
    event.preventDefault();
  };

  const handleKeyDown = (event: any): void => {
    // up = 38, down = 40
    if (event.keyCode === 38 || event.keyCode === 40) setCurrentLine(event);
  };

  const handleText = (event: any): void => {
    if (event.key === 'Enter') handleCommand(event);
  };

  const setCurrentLine = (event: any): void => {
    event.preventDefault();
    const change = event.keyCode === 38 ? -1 : 1;
    console.log(change);
    const current = currentLine + change;

    if (current < 0) return;
    else if (current >= history.length) setCurrentLineState(-1);
    else if (currentLine === -1) setCurrentLineState(history.length - 1);
    else setCurrentLineState(current);
    event.preventDefault();
  };

  return (
    <AppContainer title="console" appName="console">
      <div className="windows">
        <textarea
          id="win1"
          className="window"
          value={text}
          onKeyDown={handleKeyDown}
          onKeyPress={handleText}
          onChange={(e) => setText(e.target.value)}
        ></textarea>
      </div>
    </AppContainer>
  );
};

export default AppConsole;
