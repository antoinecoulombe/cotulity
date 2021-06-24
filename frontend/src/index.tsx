import React from 'react';
import ReactDOM from 'react-dom';
import LoginForm from './components/login/loginForm';
import './assets/css/login.css';

ReactDOM.render(
  <React.StrictMode>
    <div id="container">
      <div id="logo">
        <h2>Flatsharing made simple</h2>
        <h1>Cotulity</h1>
      </div>
      <LoginForm />
    </div>
  </React.StrictMode>,
  document.getElementById('root')
);
