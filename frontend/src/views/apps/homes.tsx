import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import ReactDOMServer from 'react-dom/server';
import AppContainer from '../../components/app/appContainer';
import IconToolTip from '../../components/global/iconTooltip';
import List from '../../components/utils/lists/list';
import ListItem from '../../components/utils/lists/listItem';
import ListItemLeft from '../../components/utils/lists/listLeft';
import ListItemRight from '../../components/utils/lists/listRight';
import Translate from '../../components/utils/translate';
import axios from '../../utils/fetchClient';
import { useNotifications } from '../../contexts/NotificationsContext';
import SingleInputPopup from '../../components/forms/singleInputPopup';
import WarningPopup from '../../components/global/warningPopup';

export interface Home {
  id: number;
  ownerId: number;
  refNumber: number;
  name: string;
  memberCount: number;
  UserHome: { nickname: string; accepted: boolean };
}

const nullJSX: JSX.Element = <></>;

export default function AppHomes() {
  const { setNotification, setSuccessNotification } = useNotifications();
  const history = useHistory();

  const [homes, setHomes] = useState<Home[]>([]);
  const [popup, setPopup] = useState<JSX.Element>(nullJSX);

  useEffect(() => {
    axios
      .get(`/homes/all`)
      .then((res: any) => {
        if (res.data.homes && res.data.homes.length > 0)
          setHomes(res.data.homes);
      })
      .catch((err) => {
        setNotification(err.response.data);
      });
  }, []);

  async function getRefNumber(event: any) {
    return await event.target.closest('.list-item').dataset.uid;
  }

  function getTranslateJSON(translate: string, format: Array<string>) {
    return `{"translate":"${translate}", "format": ["${format.join('","')}"]}`;
  }

  function closePopup() {
    setPopup(nullJSX);
  }

  function closeAndSuccess(data: any) {
    setSuccessNotification(data);
    closePopup();
  }

  function closeAndError(data: any) {
    setNotification(data);
    closePopup();
  }

  async function showWarningPopup(event: any, action: string) {
    const ref = await getRefNumber(event);

    setPopup(
      <WarningPopup
        title={getTranslateJSON(`homes.${action}.text.title`, [
          homes.find((h) => h.refNumber == ref)?.name ?? '',
        ])}
        desc={`homes.${action}.text.desc`}
        yesText={`homes.${action}.buttons.yes`}
        noText={`homes.${action}.buttons.no`}
        onCancel={closePopup}
        onSubmit={() => (action === 'quit' ? quitHome(ref) : deleteHome(ref))}
      >
        {`homes.tooltip.${action === 'quit' ? 'quitHome' : 'deleteHome'}`}
      </WarningPopup>
    );
  }

  function deleteHome(refNumber: number) {
    axios
      .delete(`/homes/delete/${refNumber}`)
      .then((res: any) => {
        closeAndSuccess(res.data);
      })
      .catch((err) => {
        closeAndError(err.response.data);
      });
  }

  function quitHome(refNumber: number) {
    axios
      .delete(`/homes/quit/${refNumber}`)
      .then((res: any) => {
        closeAndSuccess(res.data);
      })
      .catch((err) => {
        closeAndError(err.response.data);
      });
  }

  async function showPopup(event: any, action: string) {
    const ref = await getRefNumber(event);

    setPopup(
      <SingleInputPopup
        name={`homes.name.${action}`}
        title={getTranslateJSON(`homes.title.${action}`, [
          homes.find((h) => h.refNumber == ref)?.name ?? '',
        ])}
        onCancel={closePopup}
        onSubmit={(value: string) =>
          action === 'addMember'
            ? addMember(value, ref)
            : renameHome(value, ref)
        }
        style={{ iconWidth: 32, tooltipMultiplier: 15 }}
      >
        {getTranslateJSON(`homes.tooltip.${action}`, ['defaultName'])}
      </SingleInputPopup>
    );
  }

  function renameHome(value: string, refNumber: number) {
    axios
      .post(`/homes/rename/${refNumber}`, { data: { nickname: value } })
      .then((res: any) => {
        closeAndSuccess(res.data);
      })
      .catch((err) => {
        closeAndError(err.response.data);
      });
  }

  function addMember(value: string, refNumber: number) {
    axios
      .post(`/homes/invite/${refNumber}`, { data: { email: value } })
      .then((res: any) => {
        closeAndSuccess(res.data);
      })
      .catch((err) => {
        closeAndError(err.response.data);
      });
  }

  async function editHome(event: any) {
    console.log(`NOT IMPLEMENTED YET. (edit)`);
    // const ref = await getRefNumber(event);
    // axios
    //   .get(`/homes/${ref}`)
    //   .then((res: any) => {
    //     setSuccessNotification(res.data);
    //   })
    //   .catch((err) => {
    //     setNotification(err.response.data);
    //   });
  }

  async function cancelRequest(event: any) {
    const ref = await getRefNumber(event);

    axios
      .post(`/homes/cancelRequest/${ref}`)
      .then((res: any) => {
        setSuccessNotification(res.data);
      })
      .catch((err) => {
        setNotification(err.response.data);
      });
  }

  const iconStyle = {
    iconWidth: 34,
    tooltipMultiplier: 10,
  };

  return (
    <AppContainer
      title="yourHomes"
      appName="homes"
      onAddClick={() => history.push('/apps/homes/new')}
      popup={popup}
    >
      <List>
        {homes.map((home) => (
          <ListItem key={home.id} uid={home.refNumber}>
            <ListItemLeft style={{ height: iconStyle.iconWidth }}>
              <h3>{home.UserHome.nickname ?? home.name}</h3>
              <p>
                - {home.memberCount}{' '}
                <Translate name="member" prefix="homes.list."></Translate>
                {home.memberCount === 1 ? '' : 's'}
              </p>
            </ListItemLeft>
            <ListItemRight>
              {!home.UserHome.accepted && (
                <>
                  <IconToolTip
                    icon="times-circle"
                    style={iconStyle}
                    error={true}
                    onClick={cancelRequest}
                  >
                    {ReactDOMServer.renderToStaticMarkup(
                      <Translate
                        name="cancelRequest"
                        prefix="homes.action."
                      ></Translate>
                    )}
                  </IconToolTip>
                  <div className="tag">
                    <Translate
                      name="requestPending"
                      prefix="homes.tag."
                    ></Translate>
                  </div>
                </>
              )}
              {localStorage.getItem('userId') == home.ownerId.toString() &&
                home.UserHome.accepted && (
                  <>
                    <IconToolTip
                      icon="times-circle"
                      style={iconStyle}
                      error={true}
                      onClick={(e) => showWarningPopup(e, 'delete')}
                    >
                      {ReactDOMServer.renderToStaticMarkup(
                        <Translate
                          name="deleteHome"
                          prefix="homes.action."
                        ></Translate>
                      )}
                    </IconToolTip>
                    <IconToolTip
                      icon="pen"
                      style={iconStyle}
                      circled={{ value: true, multiplier: 0.45 }}
                      onClick={editHome}
                    >
                      {ReactDOMServer.renderToStaticMarkup(
                        <Translate
                          name="editHome"
                          prefix="homes.action."
                        ></Translate>
                      )}
                    </IconToolTip>
                    <IconToolTip
                      icon="user-plus"
                      style={iconStyle}
                      circled={{ value: true, multiplier: 0.55, offset: 1 }}
                      onClick={(e) => showPopup(e, 'inviteMember')}
                    >
                      {ReactDOMServer.renderToStaticMarkup(
                        <Translate
                          name="addMember"
                          prefix="homes.action."
                        ></Translate>
                      )}
                    </IconToolTip>
                  </>
                )}
              {!(localStorage.getItem('userId') == home.ownerId.toString()) &&
                home.UserHome.accepted && (
                  <>
                    <IconToolTip
                      icon="sign-out-alt"
                      style={iconStyle}
                      circled={{ value: true, multiplier: 0.58, offset: 1 }}
                      error={true}
                      onClick={(e) => showWarningPopup(e, 'quit')}
                    >
                      {ReactDOMServer.renderToStaticMarkup(
                        <Translate
                          name="quitHome"
                          prefix="homes.action."
                        ></Translate>
                      )}
                    </IconToolTip>
                    <IconToolTip
                      icon="pen"
                      style={iconStyle}
                      circled={{ value: true, multiplier: 0.45 }}
                      onClick={(e) => showPopup(e, 'renameHome')}
                    >
                      {ReactDOMServer.renderToStaticMarkup(
                        <Translate
                          name="renameHome"
                          prefix="homes.action."
                        ></Translate>
                      )}
                    </IconToolTip>
                  </>
                )}
            </ListItemRight>
          </ListItem>
        ))}
      </List>
    </AppContainer>
  );
}
