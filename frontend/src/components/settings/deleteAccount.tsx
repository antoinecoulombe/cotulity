import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useHistory } from 'react-router';
import axios from '../../utils/fetchClient';
import WarningPopup from '../../components/global/warningPopup';
import Translate from '../../components/utils/translate';

interface DeleteAccountProps {
  setPopup(popup: JSX.Element): void;
}

const nullJSX: JSX.Element = <></>;

const DeleteAccount = (props: DeleteAccountProps): JSX.Element => {
  const {
    setErrorNotification,
    setSuccessNotification,
    clearAllNotifications,
  } = useNotifications();
  const history = useHistory();

  const showWarningPopup = (): void => {
    props.setPopup(
      <WarningPopup
        title="settings.account.delete.title"
        yesText="settings.account.delete.buttons.yes"
        noText="settings.account.delete.buttons.no"
        onCancel={() => props.setPopup(nullJSX)}
        onYes={deleteAccount}
      ></WarningPopup>
    );
  };

  const deleteAccount = (): void => {
    axios
      .delete('/users/delete')
      .then((res) => {
        localStorage.clear();
        clearAllNotifications();
        history.push('/');
        setSuccessNotification(res.data);
      })
      .catch((err) => {
        setErrorNotification(err.response.data);
      });
  };

  return (
    <div className="setting centered delete">
      <button className="yes" onClick={showWarningPopup}>
        <FontAwesomeIcon icon="trash" />
        <Translate name="deleteAccount" prefix="settings." />
      </button>
    </div>
  );
};

export default DeleteAccount;
