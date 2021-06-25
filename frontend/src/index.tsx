import React from 'react';
import ReactDOM from 'react-dom';
import LoginForm from './components/login/loginForm';
import './assets/css/login.css';
import logo from './assets/images/logo.png';

ReactDOM.render(
  <React.StrictMode>
    <div id="container">
      <LoginForm />
    </div>
    <div className="logo small"></div>
    <div className="logo big"></div>
  </React.StrictMode>,
  document.getElementById('root')
);
