import React from 'react';
import SingleInputForm, {
  SingleInputFormProps,
} from '../forms/singleInputForm';

export default function SingleInputPopup(props: SingleInputFormProps) {
  return (
    <div className="popup-container">
      {/* <div className="close-btn"></div> */}
      <div className="si-popup">
        <SingleInputForm {...props} className="in-popup">
          {props.children}
        </SingleInputForm>
      </div>
    </div>
  );
}
