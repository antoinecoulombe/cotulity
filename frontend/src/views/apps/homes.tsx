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

export default function AppHomes() {
  const history = useHistory();
  const [homes, setHomes] = useState([]);
  const { setNotification } = useNotifications();

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

  function deleteHome(event: any) {
    // if home creator
    console.log('delete');
  }

  function quitHome(event: any) {
    // if not home creator (replaces removeHome)
    console.log('quit');
  }

  function editHome(event: any) {
    // if home creator
    console.log('edit');
  }

  function renameHome(event: any) {
    // if not home creator (replaces editHome)
    console.log('rename');
  }

  function addMember(event: any) {
    // if home creator (otherwise hidden)
    console.log('add member');
  }

  function cancelRequest(event: any) {}

  const iconStyle = {
    iconWidth: 34,
    tooltipMultiplier: 10,
  };

  const iconStyleCircled = {
    // iconWidth:
  };

  let creator = false;
  let pending = true;

  return (
    <AppContainer
      title="yourHomes"
      appName="homes"
      onAddClick={() => history.push('/apps/homes/new')}
    >
      <List>
        <ListItem>
          <ListItemLeft style={{ height: iconStyle.iconWidth }}>
            <h3>Blainville </h3>
            <p>
              - 4 <Translate name="members" prefix="homes.list."></Translate>
            </p>
          </ListItemLeft>
          <ListItemRight>
            {pending && (
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
            {creator && !pending && (
              <>
                <IconToolTip
                  icon="times-circle"
                  style={iconStyle}
                  error={true}
                  onClick={deleteHome}
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
                  onClick={addMember}
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
            {!creator && !pending && (
              <>
                <IconToolTip
                  icon="sign-out-alt"
                  style={iconStyle}
                  circled={{ value: true, multiplier: 0.58, offset: 1 }}
                  error={true}
                  onClick={quitHome}
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
                  onClick={renameHome}
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
      </List>
    </AppContainer>
  );
}
