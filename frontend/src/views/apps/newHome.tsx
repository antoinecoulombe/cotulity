import React, { useState, useEffect } from 'react';
import $ from 'jquery';
import '../../assets/css/apps.css';
import App from '../../components/apps/app';
import Input from '../../components/forms/input';
import SingleInput from '../../components/forms/SingleInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useHistory } from 'react-router';

const initForm = {
  name: '',
};

export default function AppNewHome() {
  const { setSuccessNotification, setErrorNotification } = useNotifications();
  const history = useHistory();
  const [action, setAction] = useState<string>();
  const [form, setForm] = useState(initForm);

  function handleClick(name: string) {
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

  function handleSubmit() {
    axios
      .post(`/homes/${action}`, form)
      .then((res) => {
        setSuccessNotification(res.data);
        history.push('/apps');
      })
      .catch((err) => {
        setErrorNotification(err.data);
      });
  }

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {action !== undefined && (
        <div className="form">
          <SingleInput
            name="home"
            type="text"
            value={form.name}
            onChange={(e: any) => setForm({ ...form, name: e.target.value })}
            title={`newHome.${action}.title`}
            label={`newHome.${action}.label`}
            style={{ iconWidth: 23, tooltipMultiplier: 20 }}
          >{`newHome.${action}.tooltip`}</SingleInput>
          <FontAwesomeIcon
            icon="arrow-alt-circle-right"
            className="submit"
            onClick={handleSubmit}
          ></FontAwesomeIcon>
        </div>
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
