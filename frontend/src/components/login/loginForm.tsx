import React, { ComponentState } from "react";
import $ from "jquery";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowAltCircleRight } from "@fortawesome/free-solid-svg-icons";

import Input from "../forms/input";
import FormToggle from "./formToggle";

// TODO: Request login/subscribe to Rest API on ['submit click', 'enter keypress']
// TODO: Add validation

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
    window.addEventListener("load", this.handleLoad);
  }

  componentWillUnmount() {
    window.removeEventListener("load", this.handleLoad);
  }

  handleLoad() {
    $("#logo").animate({ opacity: 1 }, 750);

    setTimeout(() => {
      $("#container").animate({ width: 482 }, 400);

      setTimeout(() => {
        $("#logo > h1").animate({ marginBottom: 35 }, 100);
        $("#login").animate({ opacity: 1 }, 300);
      }, 500);
    }, 1250);
  }

  handleToggleClick() {
    this.setState({ login: !this.state.login });
  }

  handleInputChange(field: string, value: string) {
    this.setState({ [field]: value } as ComponentState);
  }

  render() {
    return (
      <form id="login" action="/authenticate" method="post">
        <Input
          name={"email"}
          label={"Email"}
          type={"email"}
          onChange={this.handleInputChange}
        />
        <Input
          name={"password"}
          label={"Password"}
          type={"password"}
          onChange={this.handleInputChange}
        />

        <FontAwesomeIcon
          icon={faArrowAltCircleRight}
          className="submit"
        ></FontAwesomeIcon>

        <Input
          name={"phone"}
          label={"Phone"}
          type={"phone"}
          classes={["signup"]}
          onChange={this.handleInputChange}
        />
        <Input
          name={"cpassword"}
          label={"Confirm Password"}
          type={"password"}
          classes={["signup"]}
          onChange={this.handleInputChange}
        />
        <Input
          name={"firstname"}
          label={"Firstname"}
          type={"text"}
          classes={["signup"]}
          onChange={this.handleInputChange}
        />
        <Input
          name={"lastname"}
          label={"Lastname"}
          type={"text"}
          classes={["signup"]}
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
