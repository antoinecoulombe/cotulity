import React from 'react';

interface ButtonProps {
  name?: string;
  type?: 'text' | 'password' | 'phone' | 'email' | 'password';
  label?: string;
  classes?: Array<string>;
  onClick: void;
}

class Button extends React.Component<ButtonProps> {
  constructor(props: ButtonProps) {
    super(props);
  }

  render() {
    return (
      <div className={this.props.classes?.toString().replace(',', ' ')}>
        <button>Change theme</button>
      </div>
    );
  }
}

export default Button;
