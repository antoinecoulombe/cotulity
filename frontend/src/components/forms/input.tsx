import React from "react";
import $ from "jquery";

// TODO: Add validation error label + error styling (red border + shadow?)

interface InputProps {
  name: string;
  type: "text" | "password" | "phone" | "email" | "password";
  label: string;
  classes?: Array<string>;
  onChange: (name: string, value: string) => void;
}

class Input extends React.Component<InputProps> {
  constructor(props: InputProps) {
    super(props);
  }

  handleChange(event: any) {
    this.props.onChange(event.target.name, event.target.value);
  }

  render() {
    return (
      <div
        className={
          "form-input " + this.props.classes?.toString().replace(",", " ")
        }
      >
        <input
          id={this.props.name}
          name={this.props.name}
          type={this.props.type}
          onBlur={(e) => {
            if (e.target.value.length == 0) {
              $(e.target).removeClass("filled");
              $(e.target).next().removeClass("filled");
            } else {
              $(e.target).addClass("filled");
              $(e.target).next().addClass("filled");
            }
          }}
          onChange={this.handleChange.bind(this)}
        ></input>
        <label htmlFor={this.props.name}>{this.props.label}</label>
      </div>
    );
  }
}

export default Input;
