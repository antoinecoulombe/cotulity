import Translate from '../utils/translate';
import $ from 'jquery';

interface FormToggleProps {
  login: boolean;
  onClick: () => void;
}

export default function FormToggle(props: FormToggleProps) {
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

  function toggleForm(signup: boolean) {
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

  function handleClick() {
    toggleForm(props.login);
    props.onClick();
  }

  return (
    <p className="toggle" style={{ paddingRight: 50 }}>
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
}
