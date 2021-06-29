import React from 'react';
import $ from 'jquery';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Translate from '../utils/translate';

interface FormToggleProps {
  login: boolean;
  onClick: () => void;
}

interface FormToggleState {
  text: string;
  clickableText: string;
  class: string;
}

class FormToggle extends React.Component<FormToggleProps, FormToggleState> {
  p = {
    signup: {
      static: 'login.signup-p.static',
      link: 'login.signup-p.link',
    },
    login: {
      static: 'login.login-p.static',
      link: 'login.login-p.link',
    },
  };

  constructor(props: any) {
    super(props);
  }

  toggleForm(signup: boolean) {
    $('.toggle').css('opacity', 0);
    $('.toggle').hide();

    $('.form-input.signup').animate({ opacity: signup ? 1 : 0 }, 500, () => {
      if (!signup) $('.form-input.signup').hide();

      $('.toggle').css('padding-right', signup ? 56 : 50);
      $('.toggle').show();
      $('.toggle').animate({ opacity: 1 }, 500);
    });

    if (signup) {
      $('.form-input.signup').css('display', 'inline-block');
      setTimeout(() => $('.submit').animate({ top: 119 }, 275), 150);
    } else {
      $('.submit').animate({ top: -4 }, 275);
    }
  }

  handleClick() {
    this.toggleForm(this.props.login);
    this.props.onClick();
  }

  render() {
    return (
      <p className="toggle">
        <i>
          <Translate
            name={
              !this.props.login ? this.p.login.static : this.p.signup.static
            }
            spaceAfter={true}
          />
        </i>
        <i onClick={this.handleClick.bind(this)}>
          <Translate
            name={!this.props.login ? this.p.login.link : this.p.signup.link}
          />
        </i>
      </p>
    );
  }
}

export default FormToggle;
