import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import ReactDOMServer from 'react-dom/server';
import AppContainer from '../../components/app/appContainer';
import IconToolTip from '../../components/utils/iconTooltip';
import List from '../../components/utils/lists/list';
import ListItem from '../../components/utils/lists/listItem';
import ListItemLeft from '../../components/utils/lists/listLeft';
import ListItemRight from '../../components/utils/lists/listRight';
import Translate from '../../components/utils/translate';
import axios from '../../utils/fetchClient';
import { useNotifications } from '../../contexts/NotificationsContext';
import SingleInputPopup from '../../components/utils/singleInputPopup';
import WarningPopup from '../../components/utils/warningPopup';

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
  const history = useHistory();
  const [homes, setHomes] = useState<Home[]>([]);
  const { setNotification, setSuccessNotification } = useNotifications();
  const [popup, setPopup] = useState<JSX.Element>(nullJSX);
  const [refNumber, setRefNumber] = useState<number>();

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

  function getRefNumber(event: any): number {
    return 1;
  }

  function getTranslateJSON(translate: string, format: Array<string>) {
    return `{"translate":"${translate}", "format": ["${format.join('","')}"]}`;
  }

  function closeAndSuccess(data: any) {
    setSuccessNotification(data);
    setPopup(nullJSX);
  }

  function closeAndError(data: any) {
    setNotification(data);
    setPopup(nullJSX);
  }

  function showWarningPopup(event: any, action: string) {
    setRefNumber(getRefNumber(event));

    setPopup(
      <WarningPopup
        title={getTranslateJSON(`homes.${action}.text.title`, ['currentName'])}
        desc={`homes.${action}.text.desc`}
        yesText={`homes.${action}.buttons.yes`}
        noText={`homes.${action}.buttons.no`}
        cancelAction={() => setPopup(nullJSX)}
        doAction={action === 'quit' ? quitHome : deleteHome}
      >
        {`homes.tooltip.${action === 'quit' ? 'quitHome' : 'deleteHome'}`}
      </WarningPopup>
    );
  }

  function deleteHome(event: any) {
    // if home creator
    axios
      .delete(`/homes/delete/${getRefNumber(event)}`)
      .then((res: any) => {
        closeAndSuccess(res.data);
      })
      .catch((err) => {
        closeAndError(err.response.data);
      });
  }

  function quitHome(event: any) {
    // if not home creator (replaces removeHome)
    axios
      .delete(`/homes/quit/${getRefNumber(event)}`)
      .then((res: any) => {
        closeAndSuccess(res.data);
      })
      .catch((err) => {
        closeAndError(err.response.data);
      });
  }

  function showPopup(event: any, action: string) {
    setRefNumber(getRefNumber(event));

    setPopup(
      <SingleInputPopup
        name={`homes.name.${action}`}
        title={getTranslateJSON(`homes.title.${action}`, ['currentName'])}
        onSubmit={action === 'addMember' ? addMember : renameHome}
        style={{ iconWidth: 32, tooltipMultiplier: 15 }}
      >
        {getTranslateJSON(`homes.tooltip.${action}`, ['defaultName'])}
      </SingleInputPopup>
    );
  }

  function renameHome(value: string) {
    axios
      .post(`/homes/rename/${refNumber}`, { data: { nickname: value } })
      .then((res: any) => {
        closeAndSuccess(res.data);
      })
      .catch((err) => {
        closeAndError(err.response.data);
      });
  }

  function addMember(value: string) {
    // if home creator (otherwise hidden)
    axios
      .post(`/homes/invite/${refNumber}`, { data: { email: value } })
      .then((res: any) => {
        closeAndSuccess(res.data);
      })
      .catch((err) => {
        closeAndError(err.response.data);
      });
  }

  function editHome(event: any) {
    // if home creator
    // get all home information
    axios
      .get(`/homes/${getRefNumber(event)}`)
      .then((res: any) => {
        setSuccessNotification(res.data);
      })
      .catch((err) => {
        setNotification(err.response.data);
      });
  }

  function cancelRequest(event: any) {
    setRefNumber(getRefNumber(event));

    // if request pending
    axios
      .post(`/homes/cancelRequest/${refNumber}`)
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
          <ListItem key={home.id}>
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
