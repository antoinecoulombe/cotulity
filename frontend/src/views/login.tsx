import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/login.css';
import LoginForm from '../components/login/loginForm';

export default function LoginPage() {
  const [theme, setTheme] = useState('light');

  return (
    <>
      <div id="container">
        <LoginForm />
      </div>
      <div className="logo big"></div>
    </>
  );
}
