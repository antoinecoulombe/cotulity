import React, { useEffect } from 'react';
import $ from 'jquery';
import '../../assets/css/apps.css';
import App from '../../components/apps/app';

export default function NewHomePage() {
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

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <div id="apps-container">
        <div id="apps">
          <App icon="home" name="create"></App>
          <App icon="home" name="join"></App>
        </div>
      </div>
    </>
  );
}
