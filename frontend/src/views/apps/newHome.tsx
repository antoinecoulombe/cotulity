import { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useHistory } from 'react-router';
import App from '../../components/apps/app';
import SingleInputForm from '../../components/forms/singleInputForm';
import axios from '../../utils/fetchClient';
import $ from 'jquery';
import '../../assets/css/views/apps.css';

const AppNewHome = (): JSX.Element => {
  const { setSuccessNotification, setErrorNotification } = useNotifications();
  const history = useHistory();
  const [action, setAction] = useState<string | undefined>();
  const [error, setError] = useState<boolean>(false);

  const handleClick = (name: string): void => {
    setAction(name);
  };

  const handleResize = (): void => {
    let containerWidth = $('#apps-container').outerWidth() ?? 500,
      appWidth = $('.app-container').outerWidth(true) ?? 500,
      appsPerLine = Math.floor(containerWidth / appWidth);

    if (appsPerLine > $('.app-container').length)
      appsPerLine = $('.app-container').length;

    $('#apps').css({
      width: appWidth * appsPerLine,
    });
  };

  const postJoin = (value: string): void => {
    if (!value || value.split('#').length < 2) {
      setError(true);
      setErrorNotification({
        title: 'newHome.missingId',
        msg: 'newHome.missingId',
      });
      return;
    }

    axios
      .put(`/homes/${value.split('#')[1]}/join`)
      .then((res) => {
        setError(false);
        setSuccessNotification(res.data);
        history.push('/apps');
      })
      .catch((err) => {
        setError(true);
        setErrorNotification(err.response.data);
      });
  };

  const postCreate = (value: string): void => {
    if (!value) {
      setError(true);
      setErrorNotification({
        title: 'newHome.missingName',
        msg: 'newHome.missingName',
      });
      return;
    }

    axios
      .post(`/homes/${value}`)
      .then((res) => {
        setError(false);
        setSuccessNotification(res.data);
        localStorage.setItem('currentHome', res.data.refNumber);
        history.push('/apps');
      })
      .catch((err) => {
        setErrorNotification(err.response.data);
        setError(true);
      });
  };

  const handleSubmit = (value: string): void => {
    if (action === 'join') postJoin(value);
    else postCreate(value);
  };

  const handleBack = (): void => {
    setError(false);
    setAction(undefined);
  };

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
          iconStyle={{ iconWidth: 36, tooltipMultiplier: 5 }}
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
};

export default AppNewHome;
