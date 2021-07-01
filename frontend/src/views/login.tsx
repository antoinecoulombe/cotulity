import React from 'react';
import '../assets/css/login.css';
import LoginForm from '../components/login/loginForm';

export default function LoginPage() {
  return (
    <>
      <div id="container">
        <LoginForm />
      </div>
      <div className="logo big"></div>
    </>
  );
}
