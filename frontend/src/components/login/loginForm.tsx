import React, { ComponentState } from 'react';
import $ from 'jquery';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Input from '../forms/input';
import FormToggle from './formToggle';

interface LoginFormProps {}

interface LoginFormState {
  login: boolean;
}

class LoginForm extends React.Component<LoginFormProps, LoginFormState> {
  constructor(props: any) {
    super(props);
    this.state = {
      login: true,
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentDidMount() {
    window.addEventListener('load', this.handleLoad);
  }

  componentWillUnmount() {
    window.removeEventListener('load', this.handleLoad);
  }

  handleLoad() {
    $('.logo.big').animate({ opacity: 1 }, 400);

    setTimeout(() => {
      $('#container').animate({ width: 482 }, 400);

      $('.logo.big').animate({ opacity: 0.2 }, 750);
      setTimeout(() => {
        $('#login').animate({ opacity: 1 }, 300);
      }, 600);
    }, 900);
  }

  handleToggleClick() {
    this.setState({ login: !this.state.login });
  }

  handleInputChange(field: string, value: string) {
    this.setState({ [field]: value } as ComponentState);
  }

  render() {
    return (
      <form
        id="login"
        action={this.state.login ? '/auth/login' : '/users/register'}
        method="post"
      >
        <Input
          name={'email'}
          type={'email'}
          onChange={this.handleInputChange}
        />
        <Input
          name={'password'}
          type={'password'}
          onChange={this.handleInputChange}
        />

        <FontAwesomeIcon
          icon="arrow-alt-circle-right"
          className="submit"
        ></FontAwesomeIcon>

        <Input
          name={'phone'}
          type={'phone'}
          classes={['signup']}
          onChange={this.handleInputChange}
        />
        <Input
          name={'cpassword'}
          type={'password'}
          classes={['signup']}
          onChange={this.handleInputChange}
        />
        <Input
          name={'firstname'}
          type={'text'}
          classes={['signup']}
          onChange={this.handleInputChange}
        />
        <Input
          name={'lastname'}
          type={'text'}
          classes={['signup']}
          onChange={this.handleInputChange}
        />

        <FormToggle
          login={this.state.login}
          onClick={this.handleToggleClick.bind(this)}
        />
      </form>
    );
  }
}

export default LoginForm;
