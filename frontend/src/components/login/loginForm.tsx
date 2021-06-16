import React, { ComponentState } from 'react';
import Input from '../forms/input';
import Icon from '../utils/icon';
import FormToggle from './formToggle';

interface LoginFormProps {

}

interface LoginFormState {
  login: boolean,
}

class LoginForm extends React.Component<LoginFormProps, LoginFormState> {
  constructor(props : any) {
    super(props);
    this.state = {
      login: true,
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleToggleClick() {
    this.setState({"login": !this.state.login});
  }

  handleInputChange(field : string, value : string) {
    this.setState({[field]: value} as ComponentState);
  }

  render() {
    return (
      <form id="login" action="/authenticate" method="post">
        <Input name={"email"} label={"Email"} type={"email"} onChange={this.handleInputChange}/>
        <Input name={"password"} label={"Password"} type={"password"} onChange={this.handleInputChange}/>

        <Icon name={"arrow-alt-circle-right"} classes={["submit-go"]}></Icon>
        <Icon name={"circle-notch"} spinning={true} classes={["submit-load"]}></Icon>

        <Input name={"phone"} label={"Phone"} type={"phone"} classes={["signup"]} onChange={this.handleInputChange}/>
        <Input name={"cpassword"} label={"Confirm Password"} type={"password"} classes={["signup"]} onChange={this.handleInputChange}/>
        <Input name={"firstname"} label={"Firstname"} type={"text"} classes={["signup"]} onChange={this.handleInputChange}/>
        <Input name={"lastname"} label={"Lastname"} type={"text"} classes={["signup"]} onChange={this.handleInputChange}/>

        <FormToggle onClick={this.handleToggleClick.bind(this)}/>
      </form>
    );
  }
}

export default LoginForm;
