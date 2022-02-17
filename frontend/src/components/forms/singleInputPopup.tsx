import SingleInputForm, { SingleInputFormProps } from './singleInputForm';
import Popup from '../utils/popup';

interface SingleInputPopupProps {
  onCancel: (event: any) => void;
  containerClassName?: string;
}

const SingleInputPopup = (
  props: SingleInputFormProps & SingleInputPopupProps
): JSX.Element => {
  return (
    <Popup
      onCancel={props.onCancel}
      className={props.containerClassName}
      type="si"
    >
      <SingleInputForm {...props} className="in-popup">
        {props.children}
      </SingleInputForm>
    </Popup>
  );
};

export default SingleInputPopup;
