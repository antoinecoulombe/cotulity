import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getNotifications, isAuthenticated } from '../../utils/global';
import {
  jsonNotification,
  useNotifications,
} from '../../contexts/NotificationsContext';
import { useHistory, useParams } from 'react-router';
import Input from '../forms/input';
import FormToggle from './formToggle';
import axios from '../../utils/fetchClient';
import $ from 'jquery';
import Translate from '../utils/translate';
import SingleInputPopup from '../forms/singleInputPopup';

const LoginForm = (): JSX.Element => {
  let { token: inviteToken } = useParams<{ token: string }>();
  let { verifyToken } = useParams<{ verifyToken: string }>();

  const {
    setNotification,
    setSuccessNotification,
    setErrorNotification,
    setNotificationArray,
  } = useNotifications();
  const history = useHistory();

  const initForm = {
    email: '',
    password: '',
    cpassword: '',
    phone: '',
    firstname: '',
    lastname: '',
  };

  const errorForm = {
    email: false,
    password: false,
    cpassword: false,
    phone: false,
    firstname: false,
    lastname: false,
  };

  const nullJSX: JSX.Element = <></>;

  const [isLogin, setLogin] = useState(true);
  const [form, setForm] = useState(initForm);
  const [errors, setError] = useState(errorForm);
  const [popup, setPopup] = useState<JSX.Element>(nullJSX);

  const handlePasswordResetPopup = (email: string): void => {
    axios
      .post('/users/public/password/reset', { email: email })
      .then(async (res) => {
        setSuccessNotification(res.data);
        setPopup(nullJSX);
      })
      .catch((err) => {
        if (err.response?.data) setNotification(err.response.data);
      });
  };

  const showPasswordResetPopup = (): void => {
    setPopup(
      <SingleInputPopup
        name={`login.pwd-reset.placeholder`}
        title="login.pwd-reset.title"
        onCancel={() => setPopup(nullJSX)}
        onSubmit={(email: string) => handlePasswordResetPopup(email)}
        iconStyle={{ iconWidth: 32, tooltipMultiplier: 15, marginTop: 2 }}
        popupStyle={{ width: 'auto', minWidth: 400 }}
        errorCheck={(email: string) => {
          if (!email || !email.length || !email.includes('@')) {
            setErrorNotification({
              title: 'form.email.error',
              msg: 'form.error.email.valid',
            });
            return true;
          }
          return false;
        }}
        containerClassName="bg-light"
      />
    );
  };

  useEffect(() => {
    handleLoad();

    if (verifyToken) {
      axios
        .put(`/users/public/verify/${verifyToken}`)
        .then(async (res) => {
          setSuccessNotification(res.data);
        })
        .catch((err) => {
          setErrorNotification(err.response.data);
        });
    }
  }, []);

  const handleLoad = (): void => {
    $('.logo.big').animate({ opacity: 1 }, 400);

    setTimeout(() => {
      $('#container').animate({ width: 482 }, 400);

      $('.logo.big').animate({ opacity: 0.2 }, 750);
      setTimeout(() => {
        $('#login').animate({ opacity: 1 }, 300);
      }, 600);
    }, 900);
  };

  const setErrors = (): boolean => {
    let newErrors = { ...errorForm };
    newErrors.email =
      !form.email || !form.email.length || !form.email.includes('@');
    newErrors.password = !form.password || !form.password.length;
    if (!isLogin) {
      newErrors.firstname = !form.firstname || !form.firstname.length;
      newErrors.lastname = !form.lastname || !form.lastname.length;
      newErrors.cpassword = !form.cpassword || !form.cpassword.length;
      newErrors.phone = !form.phone || form.phone.length < 7;
    }

    setError(newErrors);
    for (const prop in newErrors) if (newErrors[prop]) return true;
    return false;
  };

  const login = async (): Promise<void> => {
    if (isAuthenticated()) return;
    if (setErrors()) return;

    return await axios
      .post(`/auth/login`, form)
      .then(async (res) => {
        localStorage.setItem('x-access-token', res.data.token);
        localStorage.setItem(
          'x-access-token-expiration',
          (Date.now() + 2 * 60 * 60 * 1000).toString()
        );
        localStorage.setItem('userId', res.data.userId);

        if (inviteToken) history.push(`/apps/invitations/${inviteToken}`);
        else history.push('/apps');

        setNotificationArray(await getNotifications());
      })
      .catch((err) => {
        if (err.response?.data) setNotification(err.response.data);
        else
          setErrorNotification({
            title: 'login.error',
            msg: 'request.noResponse',
          });
      });
  };

  const setValidationNotification = (input: string[], errorMsg: string) => {
    input.forEach((i: string) => {
      setError({ ...errorForm, [i]: true });
    });

    setErrorNotification({
      title: 'register.error',
      msg: errorMsg,
    });
  };

  const resetForm = (): void => {
    $('#login > .toggle > i:last-child').trigger('click');
    setForm({ ...initForm, email: form.email, password: form.password });

    let inputs = $('.form-input > input').slice(2);
    for (let i = 2; i < inputs.length; ++i) {
      $(inputs[i]).removeClass('filled');
      $(inputs[i]).next().removeClass('filled');
    }
  };

  const register = async (): Promise<void> => {
    if (isAuthenticated()) return;
    if (setErrors()) return;

    if (form.cpassword !== form.password)
      return setValidationNotification(
        ['password', 'cpassword'],
        'form.error.password.mustEqual'
      );

    return axios
      .post(`/users/register`, form)
      .then((res) => {
        setSuccessNotification(res.data);
        resetForm();
        login();
      })
      .catch((err) => {
        setValidationNotification(
          err.response?.data?.input ? [err.response.data.input] : [],
          err.response?.data?.msg ?? 'request.noResponse'
        );
      });
  };

  const handleSubmit = async (event: any): Promise<void> => {
    isLogin ? await login() : await register();
  };

  const handleKeyPress = (event: any): void => {
    if (event.key === 'Enter') handleSubmit(event);
  };

  return (
    <>
      {popup}
      <form id="login" onSubmit={(event) => handleSubmit(event)}>
        <Input
          name={'form.email'}
          type={'email'}
          value={form.email}
          onChange={(e: any) => setForm({ ...form, email: e.target.value })}
          onKeyPress={handleKeyPress}
          error={errors.email}
        />
        <Input
          name={'form.password'}
          type={'password'}
          value={form.password}
          onChange={(e: any) => setForm({ ...form, password: e.target.value })}
          onKeyPress={handleKeyPress}
          error={errors.password}
        />

        <FontAwesomeIcon
          icon="arrow-alt-circle-right"
          className="submit"
          onClick={handleSubmit}
        />

        <Input
          name={'form.phone'}
          type={'phone'}
          value={form.phone}
          className="signup"
          onChange={(e: any) => setForm({ ...form, phone: e.target.value })}
          error={errors.phone}
        />
        <Input
          name={'form.cpassword'}
          type={'password'}
          value={form.cpassword}
          className="signup"
          onChange={(e: any) => setForm({ ...form, cpassword: e.target.value })}
          error={errors.cpassword}
        />
        <Input
          name={'form.firstname'}
          type={'text'}
          value={form.firstname}
          className="signup"
          onChange={(e: any) => setForm({ ...form, firstname: e.target.value })}
          error={errors.firstname}
        />
        <Input
          name={'form.lastname'}
          type={'text'}
          value={form.lastname}
          className="signup"
          onChange={(e: any) => setForm({ ...form, lastname: e.target.value })}
          onKeyPress={handleKeyPress}
          error={errors.lastname}
        />

        <FormToggle login={isLogin} onClick={() => setLogin(!isLogin)} />
        <p className="pwd-reset" onClick={() => showPasswordResetPopup()}>
          <Translate name="link" prefix="login.pwd-reset." />
        </p>
      </form>
    </>
  );
};

export default LoginForm;
