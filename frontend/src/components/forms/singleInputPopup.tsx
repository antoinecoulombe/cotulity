import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SingleInputForm, { SingleInputFormProps } from './singleInputForm';

interface SingleInputPopupProps {
  onCancel: (event: any) => void;
}

export default function SingleInputPopup(
  props: SingleInputFormProps & SingleInputPopupProps
) {
  return (
    <div className="popup-container">
      <div className="si-popup">
        <div className="close">
          <FontAwesomeIcon
            icon="times"
            className="icon"
            onClick={props.onCancel}
          />
        </div>
        <SingleInputForm {...props} className="in-popup">
          {props.children}
        </SingleInputForm>
      </div>
    </div>
  );
}
