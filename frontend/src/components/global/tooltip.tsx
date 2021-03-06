import Translate from '../utils/translate';

interface TooltipProps {
  children: string;
  hovered: boolean;
  over?: boolean;
  parentCentered?: boolean;
  style?: object;
  noTranslate?: boolean;
}

const Tooltip = (props: TooltipProps): JSX.Element => {
  return (
    <>
      {props.hovered && (
        <div
          className={`tooltip-container  ${
            props.parentCentered === true || props.parentCentered === undefined
              ? 'parent-centered'
              : ''
          }`}
          style={props.style ?? {}}
        >
          <div className={`tooltip ${props.over ? 'over' : ''}`}>
            <p>
              {props.noTranslate ? (
                props.children
              ) : (
                <Translate name={props.children}></Translate>
              )}
            </p>
            <div className="triangle"></div>
          </div>
        </div>
      )}
    </>
  );
};

export default Tooltip;
