import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNotifications } from '../../contexts/NotificationsContext';
import axios from '../../utils/fetchClient';
import IconToolTip from '../../components/global/iconTooltip';
import Translate from '../../components/utils/translate';
import $ from 'jquery';

interface SetProfilePictureProps {}

const SetProfilePicture = (props: SetProfilePictureProps): JSX.Element => {
  const { setErrorNotification, setSuccessNotification } = useNotifications();
  const [file, setFile] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    axios
      .get(`/users/current/picture/url`)
      .then((res) => {
        if (res.data?.url) setProfilePicture(res.data.url);
      })
      .catch((err) => {});
  }, []);

  const deleteProfilePicture = (): void => {
    axios
      .delete('users/current/picture')
      .then((res) => {
        setFile(null);
        setProfilePicture(null);
        setSuccessNotification(res.data);
      })
      .catch((err) => {
        setErrorNotification(err.response.data);
      });
  };

  const onFileChange = (event: any): void => {
    let formData = new FormData();
    formData.append('file', event.target.files[0]);

    axios
      .put(`/users/current/picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        setFile(event.target.files[0]);
        $('#img-profile').attr(
          'src',
          URL.createObjectURL(event.target.files[0])
        );
        setSuccessNotification(res.data);
      })
      .catch((err) => {
        setErrorNotification(err.response.data);
      });
  };

  return (
    <div className="setting picture">
      <input
        id="img-upload-profile"
        type="file"
        style={{ display: 'none' }}
        onChange={(e) => onFileChange(e)}
      />
      <button onClick={() => $('#img-upload-profile').trigger('click')}>
        <FontAwesomeIcon icon="upload" />
        <Translate name="changePicture" prefix="settings." />
      </button>
      {file || profilePicture ? (
        <div className="img-profile-container">
          <IconToolTip
            icon="trash"
            circled={{ value: true, multiplier: 0.45 }}
            style={{ iconWidth: 40, tooltipMultiplier: 5 }}
            error={true}
            className="overlay-delete"
            onClick={deleteProfilePicture}
          >
            nav.delete
          </IconToolTip>
          {file ? (
            <img id="img-profile" alt={'NA'} />
          ) : (
            <img
              id="img-profile"
              src={`http://localhost:4000/images/public/${profilePicture}`}
              alt={'NA'}
            />
          )}
        </div>
      ) : (
        <FontAwesomeIcon icon="user-circle" />
      )}
    </div>
  );
};

export default SetProfilePicture;
