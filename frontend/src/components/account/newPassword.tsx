import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { isAuthenticated } from '../../utils/global';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useHistory, useParams } from 'react-router';
import axios from '../../utils/fetchClient';
import Input from '../forms/input';
import Title from '../forms/title';
import $ from 'jquery';

const initForm = {
  password: '',
  cpassword: '',
};

const errorForm = {
  password: false,
  cpassword: false,
};

const NewPasswordForm = (): JSX.Element => {
  let { token } = useParams<{ token: string }>();

  const { setSuccessNotification, setErrorNotification } = useNotifications();
  const history = useHistory();

  const [form, setForm] = useState(initForm);
  const [errors, setError] = useState(errorForm);

  const setValidationNotification = (input: string[], errorMsg: string) => {
    input.forEach((i: string) => {
      setError({ ...errorForm, [i]: true });
    });

    return setErrorNotification({
      title: 'pwdReset.failed',
      msg: errorMsg,
    });
  };

  useEffect(() => {
    if (!token || !token.length) {
      setErrorNotification({
        title: 'token.invalid',
        msg: 'token.invalid',
      });
    } else {
      axios
        .get(`/users/public/password/reset/${token}`)
        .then(async (res) => {})
        .catch((err) => {
          setErrorNotification(err.response.data);
        });
    }

    $('#container').css({ width: 482 });
    $('#login').css({ height: 0 });
    $('.title').css({ opacity: 0 });

    $('.logo.medium').animate({ opacity: 1 }, 600);

    setTimeout(() => {
      $('.title').animate({ opacity: 1 }, 300);
      $('#login').animate({ opacity: 1 }, 300);
    }, 500);
  }, []);

  const setErrors = (): boolean => {
    let newErrors = { ...errorForm };
    newErrors.password = !form.password || !form.password.length;
    newErrors.cpassword = !form.cpassword || !form.cpassword.length;

    setError(newErrors);
    for (const prop in newErrors) if (newErrors[prop]) return true;
    return false;
  };

  const setPassword = () => {
    if (isAuthenticated()) return;
    if (setErrors()) {
      return setErrorNotification({
        title: 'request.missingField',
        msg: 'request.missingField',
      });
    }

    if (form.cpassword !== form.password)
      return setValidationNotification(
        ['password', 'cpassword'],
        'form.error.password.mustEqual'
      );

    axios
      .put(`/users/public/password/reset/${token}`, form)
      .then((res) => {
        setSuccessNotification(res.data);
        history.push('/login');
      })
      .catch((err) => {
        setValidationNotification(
          err.response?.data?.input ? [err.response.data.input] : [],
          err.response?.data?.msg ?? 'request.noResponse'
        );
      });
  };

  const handleKeyPress = (event: any): void => {
    if (event.key === 'Enter') setPassword();
  };

  return (
    <>
      <Title style={{ marginBottom: 20, color: 'white', fontSize: 20 }}>
        Please enter your new password.
      </Title>
      <form id="login" onSubmit={setPassword}>
        <Input
          name={'form.password'}
          type={'password'}
          value={form.password}
          onChange={(e: any) => setForm({ ...form, password: e.target.value })}
          onKeyPress={handleKeyPress}
          error={errors.password}
        />
        <Input
          name={'form.cpassword'}
          type={'password'}
          value={form.cpassword}
          onChange={(e: any) => setForm({ ...form, cpassword: e.target.value })}
          error={errors.cpassword}
        />
        <FontAwesomeIcon
          icon="arrow-alt-circle-right"
          className="submit"
          onClick={setPassword}
          style={{ top: -2 }}
        />
      </form>
    </>
  );
};

export default NewPasswordForm;
