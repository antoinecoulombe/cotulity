import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { useNotifications } from '../../contexts/NotificationsContext';
import {
  getCopyIndex,
  getTranslateJSON,
  validateEmail,
} from '../../utils/global';
import AppContainer, {
  handleOpenAppResize,
} from '../../components/app/appContainer';
import axios from '../../utils/fetchClient';
import ReactDOMServer from 'react-dom/server';
import SingleInputPopup from '../../components/forms/singleInputPopup';
import WarningPopup from '../../components/global/warningPopup';
import EditPopup from '../../components/homes/editPopup';
import IconToolTip from '../../components/global/iconTooltip';
import List from '../../components/utils/lists/list';
import ListItem from '../../components/utils/lists/listItem';
import ListItemLeft from '../../components/utils/lists/listLeft';
import ListItemRight from '../../components/utils/lists/listRight';
import Translate from '../../components/utils/translate';
import '../../assets/css/apps/homes.css';

export interface Home {
  id: number;
  ownerId: number;
  refNumber: number;
  name: string;
  memberCount?: number;
  HomeUser: { nickname: string; accepted: boolean };
}

export interface HomeMember {
  id: number;
  firstname: string;
  lastname: string;
  Image: { url: string } | null;
}

const nullJSX: JSX.Element = <></>;

const AppHomes = () => {
  const { setNotification, setErrorNotification, setSuccessNotification } =
    useNotifications();
  const history = useHistory();

  const [homes, setHomes] = useState<Home[]>([]);
  const [popup, setPopup] = useState<JSX.Element>(nullJSX);

  useEffect(() => {
    handleOpenAppResize();
  }, [homes]);

  useEffect(() => {
    axios
      .get(`/homes`)
      .then((res: any) => {
        if (res.data.homes && res.data.homes.length) setHomes(res.data.homes);
        else history.push('/apps/homes/new');
      })
      .catch((err) => {
        setNotification(err.response.data);
      });
  }, []);

  const getRefNumber = async (event: any): Promise<number> => {
    return await event.target.closest('.list-item').dataset.uid;
  };

  const closePopup = (): void => {
    setPopup(nullJSX);
  };

  const closeAndSuccess = (data: any): void => {
    setSuccessNotification(data);
    closePopup();
  };

  const closeAndError = (data: any): void => {
    setNotification(data);
    closePopup();
  };

  const showWarningPopup = async (
    event: any,
    action: string,
    refNumber?: number
  ): Promise<void> => {
    const ref: number = refNumber ?? (await getRefNumber(event));
    const home: Home | undefined = homes.find((h) => h.refNumber === ref);

    setPopup(
      <WarningPopup
        title={getTranslateJSON(`homes.${action}.text.title`, [
          home?.HomeUser.nickname ?? home?.name ?? '',
        ])}
        desc={`homes.${action}.text.desc`}
        yesText={`homes.${action}.buttons.yes`}
        noText={`homes.${action}.buttons.no`}
        onCancel={closePopup}
        onYes={() => (action === 'quit' ? quitHome(ref) : deleteHome(ref))}
      >
        {`homes.tooltip.${action === 'quit' ? 'quitHome' : 'deleteHome'}`}
      </WarningPopup>
    );
  };

  const handleDeleteHomeSuccess = (res: any, refNumber: number): void => {
    const redirect = homes.length <= 1;
    deleteHomeState(refNumber);
    closeAndSuccess(res.data);
    if (redirect) history.push('/apps/homes/new');
    else if (refNumber.toString() == localStorage.getItem('currentHome'))
      localStorage.setItem(
        'currentHome',
        homes.find((h) => h.refNumber != refNumber)?.refNumber.toString() ?? ''
      );
  };

  const deleteHome = (refNumber: number): void => {
    axios
      .delete(`/home/${refNumber}/delete`)
      .then((res: any) => handleDeleteHomeSuccess(res, refNumber))
      .catch((err) => {
        closeAndError(err.response.data);
      });
  };

  const quitHome = (refNumber: number): void => {
    axios
      .delete(`/home/${refNumber}/quit`)
      .then((res: any) => handleDeleteHomeSuccess(res, refNumber))
      .catch((err) => {
        closeAndError(err.response.data);
      });
  };

  const showPopup = async (
    event: any,
    action: string,
    refNumber?: number,
    error?: boolean
  ): Promise<void> => {
    const ref = refNumber ?? (await getRefNumber(event));
    const home = homes.find((h) => h.refNumber === ref);

    setPopup(
      <SingleInputPopup
        name={`homes.name.${action}`}
        title={getTranslateJSON(`homes.title.${action}`, [
          home?.HomeUser.nickname ?? home?.name ?? '',
        ])}
        onCancel={closePopup}
        onSubmit={(value: string) =>
          action === 'inviteMember'
            ? addMember(value, ref)
            : renameHome(value, ref)
        }
        iconStyle={{ iconWidth: 32, tooltipMultiplier: 15, marginTop: 2 }}
        error={error ?? false}
      >
        {getTranslateJSON(`homes.tooltip.${action}`, [home?.name ?? ''])}
      </SingleInputPopup>
    );
  };

  const deleteHomeState = (refNumber: number): void => {
    const i = homes.findIndex((h) => h.refNumber === refNumber);
    setHomes(homes.slice(0, i).concat(homes.slice(i + 1)));
  };

  const renameHome = (value: string, refNumber: number): void => {
    axios
      .put(`/home/${refNumber}/rename`, { nickname: value })
      .then((res: any) => {
        let h = getCopyIndex(homes, (h: Home) => h.refNumber === refNumber);
        closeAndSuccess(res.data);

        if (h && h.i >= 0) {
          if (localStorage.getItem('userId') == h.cp[h.i].ownerId.toString())
            h.cp[h.i].name = value;
          else h.cp[h.i].HomeUser.nickname = value;
          setHomes(h.cp);
        }
      })
      .catch((err) => {
        setErrorNotification(err.response.data);
      });
  };

  const addMember = (value: string, refNumber: number): void => {
    if (!value || !value.length) {
      showPopup(null, 'inviteMember', refNumber, true);
      setErrorNotification({
        title: 'form.email.error',
        msg: 'form.error.email.missing',
      });
      return;
    }

    if (!validateEmail(value)) {
      showPopup(null, 'inviteMember', refNumber, true);
      setErrorNotification({
        title: 'form.email.error',
        msg: 'form.error.email.valid',
      });
      return;
    }

    axios
      .post(`/home/${refNumber}/invitations`, { email: value })
      .then((res: any) => {
        closeAndSuccess(res.data);
      })
      .catch((err) => {
        showPopup(null, 'inviteMember', refNumber, true);
        setErrorNotification(err.response.data);
      });
  };

  const updateMemberCount = (refNumber: number, count: number): void => {
    let h = getCopyIndex(homes, (h: Home) => h.refNumber === refNumber);
    if (h && h.i >= 0) {
      h.cp[h.i].memberCount = count;
      setHomes(h.cp);
    }
  };

  const showEditPopup = async (event: any, refN?: number): Promise<void> => {
    const ref = refN ?? (await getRefNumber(event));
    const home = homes.find((h) => h.refNumber === ref) ?? homes[0];

    setPopup(
      <EditPopup
        onCancel={closePopup}
        onSubmit={(value: string, refNumber: number) =>
          renameHome(value, refNumber)
        }
        onDelete={(refNumber: number) =>
          showWarningPopup(event, 'delete', refNumber)
        }
        updateMemberCount={(refNumber: number, change: number) =>
          updateMemberCount(refNumber, change)
        }
        home={home}
      />
    );
  };

  const cancelRequest = async (event: any): Promise<void> => {
    const ref = await getRefNumber(event);

    axios
      .delete(`/home/${ref}/requests/cancel`)
      .then((res: any) => {
        deleteHomeState(ref);
        setSuccessNotification(res.data);
      })
      .catch((err) => {
        setNotification(err.response.data);
      });
  };

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
      <List className="fill-height">
        {homes.map((home) => (
          <ListItem key={home.id} uid={home.refNumber}>
            <ListItemLeft style={{ height: iconStyle.iconWidth }}>
              <h2 className="onHover">#{home.refNumber}</h2>
              <h3>{home.HomeUser.nickname ?? home.name}</h3>
              <p>
                - {home.memberCount}{' '}
                <Translate name="member" prefix="homes.list."></Translate>
                {home.memberCount === 1 ? '' : 's'}
              </p>
            </ListItemLeft>
            <ListItemRight>
              {!home.HomeUser.accepted && (
                <>
                  <div className="tag red">
                    <Translate
                      name="requestPending"
                      prefix="homes.tag."
                    ></Translate>
                  </div>
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
                </>
              )}
              {localStorage.getItem('userId') === home.ownerId.toString() &&
                home.HomeUser.accepted && (
                  <>
                    <IconToolTip
                      icon="user-plus"
                      style={iconStyle}
                      circled={{ value: true, multiplier: 0.55, offsetX: 1 }}
                      onClick={(e) => showPopup(e, 'inviteMember')}
                    >
                      {ReactDOMServer.renderToStaticMarkup(
                        <Translate
                          name="addMember"
                          prefix="homes.action."
                        ></Translate>
                      )}
                    </IconToolTip>
                    <IconToolTip
                      icon="pen"
                      style={iconStyle}
                      circled={{ value: true, multiplier: 0.45 }}
                      onClick={showEditPopup}
                    >
                      {ReactDOMServer.renderToStaticMarkup(
                        <Translate
                          name="editHome"
                          prefix="homes.action."
                        ></Translate>
                      )}
                    </IconToolTip>
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
                  </>
                )}
              {!(localStorage.getItem('userId') === home.ownerId.toString()) &&
                home.HomeUser.accepted && (
                  <>
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
                    <IconToolTip
                      icon="sign-out-alt"
                      style={iconStyle}
                      circled={{
                        value: true,
                        multiplier: 0.58,
                        offsetX: 1,
                        offsetY: 1,
                      }}
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
                  </>
                )}
            </ListItemRight>
          </ListItem>
        ))}
      </List>
    </AppContainer>
  );
};

export default AppHomes;
