import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/404.css';
import { isAuthenticated } from '../utils/global';

export default function NotFoundPage() {
  return (
    <div className="container">
      <h1>404</h1>
      <h2>
        <i>Uh-Oh!</i> It seems like you lost your way. <br />
        <Link to={isAuthenticated() ? '/apps' : '/'}>
          Help us get you back to safety
        </Link>
        .
      </h2>
    </div>
  );
}
