import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconToolTip from '../global/iconTooltip';
import ReactDOMServer from 'react-dom/server';
import Translate from './translate';
import { useEffect, useRef } from 'react';
import { useOutsideAlerter } from './outsideClick';
import $ from 'jquery';

interface PopupProps {
  children: any;
  className?: string;
  popup?: JSX.Element;
  type: 'edit' | 'si' | 'warning';
  new?: boolean;
  style?: any;
  onCancel(...attr: any): any;
  onSubmit?(...attr: any): any;
  onDelete?(...attr: any): any;
}

const Popup = (props: PopupProps): JSX.Element => {
  const wrapperPopupRef = useRef(null);
  useOutsideAlerter(wrapperPopupRef, props.onCancel);

  const handleResize = (): void => {
    let winHeight = $(window).height();
    if (winHeight) {
      let popupHeight = parseInt(winHeight.toString()) - 120;
      $('.popup').css({ maxHeight: popupHeight });
      $('.popup > .form').css({ maxHeight: popupHeight - 60 });
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={`popup-container ${props.className ?? ''}`}>
      <div
        ref={wrapperPopupRef}
        className={`popup ${props.type}`}
        style={props.style}
      >
        {props.popup}
        <div className="close">
          <FontAwesomeIcon
            icon="times"
            className="icon"
            onClick={props.onCancel}
          />
        </div>
        {props.children}
        {props.onSubmit && (
          <div className="buttons">
            {props.onDelete && (
              <IconToolTip
                icon="trash"
                style={{ iconWidth: 38, tooltipMultiplier: 5 }}
                circled={{ value: true, multiplier: 0.45 }}
                error={true}
                onClick={(...attr) => props.onDelete?.(attr)}
              >
                {ReactDOMServer.renderToStaticMarkup(
                  <Translate name="delete" prefix="nav." />
                )}
              </IconToolTip>
            )}
            <button className="no" onClick={props.onCancel}>
              <p>
                <Translate name="cancel" prefix="nav." />
              </p>
            </button>
            <button
              className="save"
              onClick={(...attr) => props.onSubmit?.(attr)}
            >
              <p>
                <Translate name={props.new ? 'send' : 'save'} prefix="nav." />
              </p>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Popup;
