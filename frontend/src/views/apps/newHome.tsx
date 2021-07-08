import React, { useState, useEffect } from 'react';
import $ from 'jquery';
import '../../assets/css/apps.css';
import App from '../../components/apps/app';
import SingleInputForm from '../../components/forms/singleInputForm';
import axios from '../../utils/fetchClient';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useHistory } from 'react-router';
import IconToolTip from '../../components/utils/iconTooltip';

export default function AppNewHome() {
  const { setSuccessNotification, setErrorNotification } = useNotifications();
  const history = useHistory();
  const [action, setAction] = useState<string | undefined>();
  const [error, setError] = useState<boolean>(false);

  function handleClick(name: string) {
    setAction(name);
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

  function postJoin(value: string) {
    if (!value || value.split('#').length < 2) {
      setError(true);
      return setErrorNotification({
        title: 'newHome.missingId',
        msg: 'newHome.missingId',
      });
    }

    axios
      .post(`/homes/join/${value.split('#')[1]}`)
      .then((res) => {
        setError(false);
        setSuccessNotification(res.data);
        history.push('/apps');
      })
      .catch((err) => {
        setError(true);
        setErrorNotification(err.response.data);
      });
  }

  function postCreate(value: string) {
    if (!value) {
      setError(true);
      return setErrorNotification({
        title: 'newHome.missingName',
        msg: 'newHome.missingName',
      });
    }

    axios
      .post(`/homes/create/${value}`)
      .then((res) => {
        setError(false);
        setSuccessNotification(res.data);
        // TODO: set context to home ref number (res.data.refNumber)
        history.push('/apps');
      })
      .catch((err) => {
        setErrorNotification(err.response.data);
        setError(true);
      });
  }

  function handleSubmit(value: string) {
    if (action === 'join') postJoin(value);
    else postCreate(value);
  }

  function handleBack() {
    console.log('back');
    setError(false);
    setAction(undefined);
  }

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {action !== undefined && (
        <SingleInputForm
          name="home"
          title={`newHome.${action}.title`}
          label={`newHome.${action}.label`}
          error={error}
          style={{ iconWidth: 36, tooltipMultiplier: 10 }}
          onSubmit={handleSubmit}
          onBack={handleBack}
        >{`newHome.${action}.tooltip`}</SingleInputForm>
      )}
      {action === undefined && (
        <div id="apps-container">
          <div id="apps">
            <App icon="home" name="create" onClick={handleClick}></App>
            <App icon="home" name="join" onClick={handleClick}></App>
          </div>
        </div>
      )}
    </>
  );
}
