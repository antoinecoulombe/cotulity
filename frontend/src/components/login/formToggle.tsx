import Translate from '../utils/translate';
import $ from 'jquery';

interface FormToggleProps {
  login: boolean;
  onClick: () => void;
}

const FormToggle = (props: FormToggleProps): JSX.Element => {
  var p = {
    signup: {
      static: 'login.signup-p.static',
      link: 'login.signup-p.link',
    },
    login: {
      static: 'login.login-p.static',
      link: 'login.login-p.link',
    },
  };

  const toggleForm = (signup: boolean): void => {
    $('.toggle, .pwd-reset').css('opacity', 0);
    $('.toggle, .pwd-reset').hide();

    $('.form-input.signup').animate({ opacity: signup ? 1 : 0 }, 500, () => {
      if (!signup) $('.form-input.signup').hide();

      $('.toggle, .pwd-reset').show();
      $('.toggle, .pwd-reset').animate({ opacity: 1 }, 500);
    });

    if (signup) {
      $('.form-input.signup').css('display', 'inline-block');
      setTimeout(() => $('.submit').animate({ top: 122 }, 275), 150);
    } else {
      $('.submit').animate({ top: -2 }, 275);
    }
  };

  const handleClick = (): void => {
    toggleForm(props.login);
    props.onClick();
  };

  return (
    <p className="toggle">
      <i>
        <Translate
          name={!props.login ? p.login.static : p.signup.static}
          spaceAfter={true}
        />
      </i>
      <i onClick={handleClick}>
        <Translate name={!props.login ? p.login.link : p.signup.link} />
      </i>
    </p>
  );
};

export default FormToggle;
