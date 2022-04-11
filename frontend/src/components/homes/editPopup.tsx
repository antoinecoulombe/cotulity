import { useEffect, useState } from 'react';
import Toggle, { Tab } from '../global/toggle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Home } from '../../views/apps/homes';
import { useNotifications } from '../../contexts/NotificationsContext';
import { getCopyIndex, getTranslateJSON } from '../../utils/global';
import List from '../utils/lists/list';
import ListItem from '../utils/lists/listItem';
import ListItemLeft from '../utils/lists/listLeft';
import Popup from '../utils/popup';
import ListItemRight from '../utils/lists/listRight';
import IconToolTip from '../global/iconTooltip';
import ReactDOMServer from 'react-dom/server';
import Translate from '../utils/translate';
import SingleInputForm from '../forms/singleInputForm';
import axios from '../../utils/fetchClient';
import WarningPopup from '../global/warningPopup';

interface HomeMember {
  id: number;
  firstname: string;
  lastname: string;
  Image: { url: string } | null;
  HomeUser: { nickname?: string; accepted: boolean };
}

interface EditPopupProps {
  home: Home;
  onCancel(...attr: any): any;
  onSubmit(...attr: any): any;
  updateMemberCount(...attr: any): any;
  onDelete?(...attr: any): any;
}

interface ToggleTabs {
  name: string;
  prefix: string;
  active: boolean;
  body: JSX.Element;
}

const nullJSX = <></>;

const EditPopup = (props: EditPopupProps): JSX.Element => {
  const { setErrorNotification } = useNotifications();
  const [name, setName] = useState<string>();
  const [error, setError] = useState<boolean>(false);
  const [members, setMembers] = useState<HomeMember[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [popup, setPopup] = useState<JSX.Element>(nullJSX);

  useEffect(() => {
    setTabs(getTabs(members));
    const count = members.filter((m) => m.HomeUser.accepted).length;
    if (count > 0) props.updateMemberCount(props.home.refNumber, count);
  }, [setErrorNotification, props, members]);

  useEffect(() => {
    axios
      .get(`/home/${props.home.refNumber}`)
      .then((res: any) => {
        setMembers(res.data.Members);
      })
      .catch((err) => {
        setErrorNotification(err.response.data);
      });
  }, [props]);

  // #region Toggle

  const getTabs = (homeMembers: HomeMember[]): ToggleTabs[] => {
    return [
      {
        name: 'members',
        prefix: 'homes.list.',
        active: true,
        body: (
          <List>
            {homeMembers
              .filter((m) => m.HomeUser.accepted)
              .map((m, i) => (
                <ListItem key={`m-${i}`} uid={m.id}>
                  <ListItemLeft key={`ml-${i}`}>
                    <div key={`mlp-${i}`} className="img-text">
                      {props.home.ownerId !== m.id && (
                        <IconToolTip
                          key={`mlpb-${i}`}
                          icon="user-minus"
                          style={{
                            iconWidth: 30,
                            tooltipMultiplier: 6,
                          }}
                          circled={{
                            value: true,
                            multiplier: 0.45,
                            offsetX: 1,
                          }}
                          error={true}
                          onClick={(e) => deleteMember(e, m.id)}
                        >
                          {ReactDOMServer.renderToStaticMarkup(
                            <Translate
                              name="kickMember"
                              prefix="homes.tooltip."
                            ></Translate>
                          )}
                        </IconToolTip>
                      )}
                      {m.Image?.url ? (
                        <img
                          id="img-profile"
                          src={`http://localhost:4000/images/public/${m.Image.url}`}
                          alt={'NA'}
                        />
                      ) : (
                        <FontAwesomeIcon
                          key={`rlpi-${i}`}
                          icon="user-circle"
                        ></FontAwesomeIcon>
                      )}
                      <h3 key={`mlph-${i}`}>
                        {getFormattedMemberName(m.firstname, m.lastname)}
                      </h3>
                    </div>
                    {props.home.ownerId === m.id && (
                      <IconToolTip
                        icon="crown"
                        style={{ iconWidth: 16, tooltipMultiplier: 10 }}
                        className="owner-crown"
                      >
                        {ReactDOMServer.renderToStaticMarkup(
                          <Translate
                            name="homeOwner"
                            prefix="homes.tooltip."
                          ></Translate>
                        )}
                      </IconToolTip>
                    )}
                  </ListItemLeft>
                </ListItem>
              ))}
          </List>
        ),
      },
      {
        name: 'requests',
        prefix: 'homes.list.',
        active: false,
        body: !homeMembers.filter((m) => !m.HomeUser.accepted).length ? (
          <div className="no-requests">
            <Translate name="noRequests" prefix="homes.list." />
          </div>
        ) : (
          <List>
            {homeMembers
              .filter((m) => !m.HomeUser.accepted)
              .map((m, i) => (
                <ListItem key={`r-${i}`} uid={m.id}>
                  <ListItemLeft key={`rl-${i}`}>
                    <div className="img-text" key={`rlp-${i}`}>
                      {m.Image?.url ? (
                        <img
                          id="img-profile"
                          src={`http://localhost:4000/images/public/${m.Image.url}`}
                          alt={'NA'}
                        />
                      ) : (
                        <FontAwesomeIcon
                          key={`rlpi-${i}`}
                          icon="user-circle"
                        ></FontAwesomeIcon>
                      )}
                      <h3 key={`rlph-${i}`}>
                        {getFormattedMemberName(m.firstname, m.lastname)}
                      </h3>
                    </div>
                  </ListItemLeft>
                  <ListItemRight key={`rr-${i}`}>
                    <IconToolTip
                      key={`rrit-${i}`}
                      icon="trash"
                      style={{ iconWidth: 30, tooltipMultiplier: 5 }}
                      circled={{ value: true, multiplier: 0.45 }}
                      error={true}
                      onClick={(e) => acceptRequest(e, false, m.id)}
                    >
                      {ReactDOMServer.renderToStaticMarkup(
                        <Translate name="decline" prefix="nav."></Translate>
                      )}
                    </IconToolTip>
                    <button
                      key={`rrb-${i}`}
                      className="accept"
                      onClick={(e) => acceptRequest(e, true, m.id)}
                    >
                      <p>
                        <Translate name="accept" prefix="nav."></Translate>
                      </p>
                    </button>
                  </ListItemRight>
                </ListItem>
              ))}
          </List>
        ),
      },
    ];
  };

  const acceptRequest = (
    event: any,
    accept: boolean,
    memberId: number
  ): void => {
    if (!accept && localStorage.getItem('safeDelete') === 'true') {
      setPopup(
        <WarningPopup
          title={getTranslateJSON(`homes.rejectRequest.text.title`, [''])}
          desc={`homes.rejectRequest.text.desc`}
          yesText={`homes.rejectRequest.buttons.yes`}
          noText={`homes.rejectRequest.buttons.no`}
          onCancel={() => setPopup(nullJSX)}
          onSubmit={() => requestHandleRequest(accept, memberId)}
        />
      );
    } else requestHandleRequest(accept, memberId);
  };

  const requestHandleRequest = (accept: boolean, memberId: number): void => {
    axios
      .put(
        `/home/${props.home.refNumber}/requests/${memberId}/${
          accept ? 'accept' : 'reject'
        }`
      )
      .then(async (res: any) => {
        if (accept) acceptMemberState(memberId);
        else deleteMemberState(memberId);
      })
      .catch((err) => {
        setErrorNotification(err.response.data);
      });
  };

  const deleteMemberState = async (id: number): Promise<void> => {
    let m = getCopyIndex(members, (m: HomeMember) => m.id === id);
    if (m && m.i >= 0) {
      m.cp.splice(m.i, 1);
      setMembers(m.cp);
    }
  };

  const acceptMemberState = (id: number): void => {
    let m = getCopyIndex(members, (m: HomeMember) => m.id === id);
    if (m && m.i >= 0) {
      m.cp[m.i].HomeUser.accepted = true;
      setMembers(m.cp);
    }
  };

  const deleteMember = (event: any, memberId: number): void => {
    if (localStorage.getItem('safeDelete') === 'true') {
      const name = event.target
        .closest('.img-text')
        .querySelector('h3').innerHTML;

      setPopup(
        <WarningPopup
          title={getTranslateJSON(`homes.kickMember.text.title`, [name])}
          desc={`homes.kickMember.text.desc`}
          yesText={getTranslateJSON(`homes.kickMember.buttons.yes`, [name])}
          noText={getTranslateJSON(`homes.kickMember.buttons.no`, [name])}
          onCancel={() => setPopup(nullJSX)}
          onSubmit={() => requestDeleteMember(memberId)}
        />
      );
    } else requestDeleteMember(memberId);
  };

  const getFormattedMemberName = (
    firstname: string,
    lastname: string
  ): string => {
    return `${firstname.charAt(0).toUpperCase()}${firstname.slice(1)} ${lastname
      .charAt(0)
      .toUpperCase()}.`;
  };

  const requestDeleteMember = (memberId: number): void => {
    axios
      .delete(`/home/${props.home?.refNumber}/members/${memberId}/remove`)
      .then((res: any) => {
        deleteMemberState(memberId);
      })
      .catch((err) => {
        setErrorNotification(err.response.data);
      });
  };

  // #endregion

  // #region Name

  const onChange = (event: any): void => {
    setName(event.target.value);
  };

  const onSubmit = (): void => {
    if (!name || !name.length) {
      setError(true);
      setErrorNotification({
        title: 'newHome.missingName',
        msg: 'newHome.missingName',
      });
      return;
    }

    setError(false);
    props.onSubmit(name, props.home.refNumber);
  };

  // #endregion

  const toggleTab = (name: string): void => {
    let t = getCopyIndex(tabs, (t) => t.name === name);
    if (t && t.i >= 0) {
      t.cp.forEach((t: { active: boolean }) => (t.active = false));
      t.cp[t.i].active = true;
      setTabs(t.cp);
    }
  };

  return members.length ? (
    <Popup
      onCancel={() => props.onCancel?.(props.home.refNumber)}
      onSubmit={onSubmit}
      onDelete={() => props.onDelete?.(props.home.refNumber)}
      popup={popup}
      type="edit"
    >
      <div className="form">
        <h1>Manage {props.home.HomeUser.nickname ?? props.home.name}</h1>
        <SingleInputForm
          name="homes.name.renameHome"
          title="form.name"
          type="text"
          required={true}
          parent={{ onChange: onChange }}
          iconStyle={{ iconWidth: 36, tooltipMultiplier: 8 }}
          className="in-popup"
          error={error}
        ></SingleInputForm>
        <Toggle tabs={tabs} toggleTab={toggleTab} />
      </div>
    </Popup>
  ) : (
    <></>
  );
};

export default EditPopup;
