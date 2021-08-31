import IconToolTip from '../global/iconTooltip';
import Translate from '../utils/translate';

export interface TitleProps {
  children: string;
  help?: string;
  required?: boolean;
  className?: string;
}

export default function Title(props: TitleProps) {
  return (
    <div className={`title ${props.className ?? ''}`}>
      <h2>
        <Translate name={props.children}></Translate>
        {props.required ? <b className="input-required">*</b> : ''}
      </h2>
      {props.help && (
        <IconToolTip
          icon="question-circle"
          style={{ iconWidth: 23, tooltipMultiplier: 20 }}
        >
          {props.help}
        </IconToolTip>
      )}
    </div>
  );
}
