import React, { useEffect } from 'react';
import $ from 'jquery';
import '../assets/css/apps.css';
import App from '../components/apps/app';

export default function AppsPage() {
  useEffect(() => {
    function handleResize() {
      let containerWidth = $('#apps-container').outerWidth() ?? 500,
        appWidth = $('.app-container').outerWidth(true) ?? 500,
        appsPerLine = Math.floor(containerWidth / appWidth);

      if (appsPerLine > $('.app-container').length)
        appsPerLine = $('.app-container').length;

      $('#apps').css({
        width: appWidth * appsPerLine,
        left: (containerWidth - appWidth * appsPerLine) / 2,
      });
    }

    handleResize();
    window.addEventListener('resize', handleResize);
  }, []);

  return (
    <div id="apps-container">
      <div id="apps">
        <App icon="home" id="calendar"></App>
        <App icon="file-invoice-dollar" id="finance"></App>
        <App icon="tasks" id="tasks"></App>
        <App icon="utensils" id="groceries"></App>
        <App icon="cogs" id="settings"></App>
      </div>
    </div>
  );
}
