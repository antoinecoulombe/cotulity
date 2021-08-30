import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useHistory } from 'react-router';
import Translate from '../../components/utils/translate';
import WarningPopup from '../../components/global/warningPopup';
import axios from '../../utils/fetchClient';

interface DeleteAccountProps {
  setPopup(popup: JSX.Element): void;
}

const nullJSX: JSX.Element = <></>;

export default function DeleteAccount(props: DeleteAccountProps) {
  const {
    setErrorNotification,
    setSuccessNotification,
    clearAllNotifications,
  } = useNotifications();
  const history = useHistory();

  function showWarningPopup() {
    props.setPopup(
      <WarningPopup
        title="settings.account.delete.title"
        yesText="settings.account.delete.buttons.yes"
        noText="settings.account.delete.buttons.no"
        onCancel={() => props.setPopup(nullJSX)}
        onSubmit={deleteAccount}
      ></WarningPopup>
    );
  }

  function deleteAccount() {
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
  }

  return (
    <div className="setting centered delete">
      <button className="yes" onClick={showWarningPopup}>
        <FontAwesomeIcon icon="trash" />
        <Translate name="deleteAccount" prefix="settings." />
      </button>
    </div>
  );
}
