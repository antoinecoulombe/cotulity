import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNotifications } from '../../contexts/NotificationsContext';
import Translate from '../../components/utils/translate';
import axios from '../../utils/fetchClient';
import IconToolTip from '../../components/global/iconTooltip';
import $ from 'jquery';

interface SetProfilePictureProps {}

export default function SetProfilePicture(props: SetProfilePictureProps) {
  const { setErrorNotification, setSuccessNotification } = useNotifications();
  const [file, setFile] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    axios
      .get(`/images/profile`)
      .then((res) => {
        setProfilePicture(res.data.url);
      })
      .catch((err) => {});
  }, []);

  function deleteProfilePicture() {
    axios
      .delete('users/image/delete')
      .then((res) => {
        setFile(null);
        setProfilePicture(null);
        setSuccessNotification(res.data);
      })
      .catch((err) => {
        setErrorNotification(err.response.data);
      });
  }

  function onFileChange(event: any) {
    let formData = new FormData();
    formData.append('file', event.target.files[0]);

    axios
      .put(`/users/image`, formData, {
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
  }

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
              src={`http://localhost:3000/images/public/${profilePicture}`}
              alt={'NA'}
            />
          )}
        </div>
      ) : (
        <FontAwesomeIcon icon="user-circle" />
      )}
    </div>
  );
}
