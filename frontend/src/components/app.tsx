import React, { useState } from 'react';
import '../assets/css/theme.css';
import '../assets/css/login.css';
import LoginForm from './login/loginForm';

function App() {
  const [theme, setTheme] = useState('light');

  return (
    <div className={`App ${theme}`}>
      <div id="container">
        <LoginForm />
      </div>
      <div className="logo small"></div>
      <div className="logo big"></div>
      <button
        className="btnToTrash"
        onClick={() => setTheme(theme == 'light' ? 'dark' : 'light')}
      >
        Toggle theme
      </button>
    </div>
  );
}

export default App;
