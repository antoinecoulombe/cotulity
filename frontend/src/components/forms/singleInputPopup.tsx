import SingleInputForm, { SingleInputFormProps } from './singleInputForm';
import Popup from '../utils/popup';

interface SingleInputPopupProps {
  onCancel: (event: any) => void;
}

export default function SingleInputPopup(
  props: SingleInputFormProps & SingleInputPopupProps
) {
  return (
    <Popup onCancel={props.onCancel} type="si">
      <SingleInputForm {...props} className="in-popup">
        {props.children}
      </SingleInputForm>
    </Popup>
  );
}
