import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getNotifications, isAuthenticated } from '../../utils/global';

import Input from '../forms/input';
import FormToggle from './formToggle';
import axios from '../../utils/fetchClient';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useHistory } from 'react-router';

export default function LoginForm() {
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

  const [isLogin, setLogin] = useState(true);
  const [form, setForm] = useState(initForm);
  const [errors, setError] = useState(errorForm);

  useEffect(() => {
    handleLoad();
  }, []);

  function handleLoad() {
    $('.logo.big').animate({ opacity: 1 }, 400);

    setTimeout(() => {
      $('#container').animate({ width: 482 }, 400);

      $('.logo.big').animate({ opacity: 0.2 }, 750);
      setTimeout(() => {
        $('#login').animate({ opacity: 1 }, 300);
      }, 600);
    }, 900);
  }

  async function login() {
    if (isAuthenticated()) return;

    return await axios
      .post(`/auth/login`, form)
      .then(async (res) => {
        localStorage.setItem('x-access-token', res.data.token);
        localStorage.setItem(
          'x-access-token-expiration',
          (Date.now() + 2 * 60 * 60 * 1000).toString()
        );

        history.push('/apps');

        const notifications = await getNotifications();
        setNotificationArray(notifications);

        return res.data;
      })
      .catch((err) => {
        console.log(err);
        setNotification(err.response.data);
      });
  }

  function setValidationNotification(input: string[], errorMsg: string) {
    input.forEach((i: string) => {
      setError({ ...errorForm, [i]: true });
    });

    setErrorNotification({
      title: 'register.error',
      msg: errorMsg,
    });

    console.log('ERRORS:');
    console.log(errors);
  }

  function resetForm() {
    $('#login > .toggle > i:last-child').trigger('click');
    setForm({ ...initForm, email: form.email, password: form.password });

    let inputs = $('.form-input > input').slice(2);
    for (let i = 2; i < inputs.length; ++i) {
      $(inputs[i]).removeClass('filled');
      $(inputs[i]).next().removeClass('filled');
    }
  }

  async function register() {
    if (isAuthenticated()) return;

    setError({ ...errorForm });

    if (form.cpassword != form.password)
      return setValidationNotification(
        ['password', 'cpassword'],
        'form.error.password.mustEqual'
      );

    return axios
      .post(`/users/register`, form)
      .then((res) => {
        setSuccessNotification(res.data);
        resetForm();
      })
      .catch((err) => {
        setValidationNotification(
          err.response?.data?.input ? [err.response.data.input] : [],
          err.response?.data?.msg ?? 'request.error'
        );
      });
  }

  async function handleSubmit(event: any) {
    const res = isLogin ? await login() : await register();
  }

  function handleKeyPress(event: any) {
    if (event.key === 'Enter') handleSubmit(event);
  }

  return (
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
      ></FontAwesomeIcon>

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
    </form>
  );
}
