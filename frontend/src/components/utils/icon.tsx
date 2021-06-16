import React from 'react';

interface IconProps {
    name: string,
    spinning?: boolean,
    classes?: Array<string>
}

class Icon extends React.Component<IconProps> {
    constructor(props : IconProps) {
        super(props);
    }

    render() {
        return (
            <i 
                className={
                    "fas fa-" + 
                    this.props.name +
                    (this.props.spinning === undefined ? " fa-spin " : " ") +
                    this.props.classes?.toString().replace(',', ' ')}></i>
        );
    }
}

export default Icon;