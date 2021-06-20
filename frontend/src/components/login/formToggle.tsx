import React from "react";
import $ from "jquery";

// TODO: FIND HOW TO STOP _*.less FROM COMPILING

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
      text: "Don't have an account?",
      link: "Sign up",
      class: "login-p",
    },
    login: {
      text: "Already a member?",
      link: "Log in",
      class: "signup-p",
    },
  };

  constructor(props: any) {
    super(props);
    this.state = {
      text: this.p.signup.text,
      clickableText: this.p.signup.link,
      class: this.p.signup.class,
    };
  }

  toggleState(prop: { text: string; link: string; class: string }) {
    this.setState({
      text: prop.text,
      clickableText: prop.link,
      class: prop.class,
    });
  }

  toggleForm(signup: boolean) {
    $(".toggle").css("opacity", 0);
    $(".toggle").hide();

    $(".form-input.signup").animate({ opacity: signup ? 1 : 0 }, 500, () => {
      if (!signup) $(".form-input.signup").hide();

      $(".toggle").css("padding-right", signup ? 56 : 50);
      $(".toggle").show();
      $(".toggle").animate({ opacity: 1 }, 500);
    });

    if (signup) {
      $(".form-input.signup").css("display", "inline-block");
      setTimeout(() => $(".submit").animate({ top: 119 }, 275), 150);
    } else {
      $(".submit").animate({ top: -4 }, 275);
    }
  }

  handleClick() {
    this.toggleState(this.props.login ? this.p.login : this.p.signup);
    this.toggleForm(this.props.login);
    this.props.onClick();
  }

  render() {
    return (
      <p className="toggle">
        <i>{this.state.text + " "}</i>
        <i onClick={this.handleClick.bind(this)}>{this.state.clickableText}</i>
      </p>
    );
  }
}

export default FormToggle;
