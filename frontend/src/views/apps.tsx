import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/apps.css';

export default function AppsPage() {
  return (
    <div id="apps-container">
      <div id="apps">
        <div className="app" id="app-calendar">
          <i className="far fa-calendar-alt"></i>
        </div>
        <div className="app" id="app-bills">
          <i className="fas fa-file-invoice-dollar"></i>
        </div>
        <div className="app" id="app-account">
          <i className="fas fa-user-circle"></i>
        </div>
        <div className="app" id="app-tasks">
          <i className="fas fa-tasks"></i>
        </div>
        <div className="app" id="app-groceries">
          <i className="fas fa-utensils"></i>
        </div>
        <div className="app" id="app-stocks">
          <i className="fas fa-chart-line"></i>
        </div>
        <div className="app" id="app-preferences">
          <i className="fas fa-cogs"></i>
        </div>
      </div>
    </div>
  );
}
