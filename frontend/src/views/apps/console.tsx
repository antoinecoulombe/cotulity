import React, { useState } from 'react';
import AppContainer from '../../components/app/appContainer';
import '../../assets/css/console.css';

export default function AppConsole() {
  const [history, setHistory] = useState<Array<string>>([]);
  const [currentLine, setCurrentLineState] = useState<number>(-1);
  const [text, setText] = useState<string>('> ');

  function getLastLine() {
    return text.substr(text.lastIndexOf('\n') + 3);
  }

  function handleCommand(event: any) {
    const newLine = '\n> ';
    history.push(getLastLine());
    setText(text + newLine);
    event.preventDefault();
    return;
  }

  function handleKeyDown(event: any) {
    // up = 38, down = 40
    if (event.keyCode === 38 || event.keyCode === 40) setCurrentLine(event);
  }

  function handleText(event: any) {
    if (event.key === 'Enter') handleCommand(event);
  }

  function setCurrentLine(event: any) {
    event.preventDefault();
    const change = event.keyCode === 38 ? -1 : 1;
    console.log(change);
    const current = currentLine + change;

    if (current < 0) return;
    else if (current >= history.length) setCurrentLineState(-1);
    else if (currentLine === -1) setCurrentLineState(history.length - 1);
    else setCurrentLineState(current);
    event.preventDefault();
  }

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
}
