import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface EditPopupProps {
  onCancel(...attr: any): any;
  onSubmit(...attr: any): any;
}

export default function EditPopup(props: EditPopupProps) {
  return (
    <div className="popup-container">
      <div className="edit-popup">
        <div className="close">
          <FontAwesomeIcon
            icon="times"
            className="icon"
            onClick={props.onCancel}
          />
        </div>
      </div>
    </div>
  );
}
