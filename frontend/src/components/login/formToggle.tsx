import React from 'react';

// TODO: FIND HOW TO STOP _*.less FROM COMPILING

interface FormToggleProps {
  onClick: () => void;
}

interface FormToggleState {
  text: string,
  clickableText: string,
  class: string
}

class FormToggle extends React.Component<FormToggleProps, FormToggleState> {
  subText = "Don't have an account?";
  subClickableText = "Sign up";
  subClass = "login-p";

  LogInText = "Already a member?";
  LogInClickableText = "Log in";
  LogInClass = "signup-p";

  constructor(props : any) {
    super(props);
    this.state = {
      text: this.subText, 
      clickableText: this.subClickableText, 
      class: this.subClass
    };
  }

  handleClick() {
    if (this.state.text === this.subText)
      this.setState({
        text: this.LogInText, 
        clickableText: this.LogInClickableText,
        class: this.LogInClass
      });
    else 
      this.setState({
        text: this.subText, 
        clickableText: this.subClickableText,
        class: this.subClass
      });

    this.props.onClick();
  }

  render() {
    return (
        <p className={this.state.class}>
            <i>{this.state.text + " "}</i>
            <i onClick={this.handleClick.bind(this)}>
                {this.state.clickableText}
            </i>
        </p>
    );
  }
}

export default FormToggle;