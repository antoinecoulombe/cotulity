import React, { useState, useEffect } from 'react';
import $ from 'jquery';
import '../../assets/css/apps.css';
import App from '../../components/apps/app';

export default function AppNewHome() {
  const [action, setAction] = useState<string>('create');

  function handleClick(name: string) {
    console.log(name);
    setAction(name);
    // TODO: show input
  }

  function handleResize() {
    let containerWidth = $('#apps-container').outerWidth() ?? 500,
      appWidth = $('.app-container').outerWidth(true) ?? 500,
      appsPerLine = Math.floor(containerWidth / appWidth);

    if (appsPerLine > $('.app-container').length)
      appsPerLine = $('.app-container').length;

    $('#apps').css({
      width: appWidth * appsPerLine,
    });
  }

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <div id="apps-container">
        <div id="apps">
          <App icon="home" name="create" onClick={handleClick}></App>
          <App icon="home" name="join" onClick={handleClick}></App>
        </div>
      </div>
    </>
  );
}
