import IconToolTip from '../global/iconTooltip';
import Translate from '../utils/translate';
import '../../assets/css/app/header.css';

interface HeaderProps {
  appName: string;
  title: string;
  onAddTooltip?: string;
  onAddClick?: (e: any) => void;
}

const Header = (props: HeaderProps): JSX.Element => {
  let title = '';
  const translateStart = '{"translate":"';
  if (props.title.startsWith(translateStart)) {
    title = `${props.title.substring(0, translateStart.length)}${
      props.appName
    }.title.${props.title.substring(translateStart.length)}`;
  } else title = `${props.appName}.title.${props.title}`;

  return (
    <div className="header">
      <h1>
        <Translate name={title}></Translate>
      </h1>
      {props.onAddClick && (
        <IconToolTip
          icon="plus-circle"
          style={{ iconWidth: 39, tooltipMultiplier: 5 }}
          className="add-btn"
          onClick={props.onAddClick}
        >
          {props.onAddTooltip ?? `${props.appName}.tooltip.add`}
        </IconToolTip>
      )}
    </div>
  );
};

export default Header;
