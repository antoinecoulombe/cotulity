import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/apps.css';
import { isAuthenticated } from '../utils/global';

export default function NotFoundPage() {
  return (
    <div>
      <h1>Page not found!</h1>
      <Link to={isAuthenticated() ? '/apps' : '/'}>Go to home page</Link>
    </div>
  );
}
