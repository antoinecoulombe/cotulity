import React, { useEffect, useState } from 'react';
import List from '../utils/lists/list';
import ListItem from '../utils/lists/listItem';
import ListItemLeft from '../utils/lists/listLeft';
import Popup from '../utils/popup';
import ListItemRight from '../utils/lists/listRight';
import IconToolTip from '../global/iconTooltip';
import ReactDOMServer from 'react-dom/server';
import Translate from '../utils/translate';
import SingleInputForm from '../forms/singleInputForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Toggle, { Tab } from '../global/toggle';
import { Home } from '../../views/apps/homes';
import { useNotifications } from '../../contexts/NotificationsContext';
import axios from '../../utils/fetchClient';
import _ from 'lodash';
import { getCopyIndex } from '../../utils/global';

interface HomeMember {
  id: number;
  firstname: string;
  lastname: string;
  image?: string;
  UserHome: { nickname?: string; accepted: boolean };
}

interface EditPopupProps {
  home: Home;
  onCancel(...attr: any): any;
  onSubmit(...attr: any): any;
  updateMemberCount(...attr: any): any;
  onDelete?(...attr: any): any;
}

export default function EditPopup(props: EditPopupProps) {
  const { setNotification, setErrorNotification } = useNotifications();
  const [name, setName] = useState<string>();
  const [error, setError] = useState<boolean>(false);
  const [members, setMembers] = useState<HomeMember[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([]);

  useEffect(() => {
    setTabs(getTabs(members));
    const count = members.filter((m) => m.UserHome.accepted == true).length;
    if (count > 0) props.updateMemberCount(props.home.refNumber, count);
  }, [members]);

  useEffect(() => {
    axios
      .get(`/homes/${props.home.refNumber}`)
      .then((res: any) => {
        setMembers(res.data.Members);
      })
      .catch((err) => {
        setNotification(err.response.data);
      });
  }, []);

  function getTabs(homeMembers: HomeMember[]) {
    return [
      {
        name: 'members',
        prefix: 'homes.list.',
        active: true,
        body: (
          <List>
            {homeMembers
              .filter((m) => m.UserHome.accepted)
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
                            offset: 1,
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
                      <FontAwesomeIcon
                        key={`mlpi-${i}`}
                        icon="user-circle"
                      ></FontAwesomeIcon>
                      <h3 key={`mlph-${i}`}>
                        {getFormattedMemberName(m.firstname, m.lastname)}
                      </h3>
                    </div>
                  </ListItemLeft>
                  {props.home.ownerId === m.id && (
                    <ListItemRight key={`mr-${i}`}>
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
                    </ListItemRight>
                  )}
                </ListItem>
              ))}
          </List>
        ),
      },
      {
        name: 'requests',
        prefix: 'homes.list.',
        body:
          homeMembers.filter((m) => !m.UserHome.accepted).length == 0 ? (
            <div className="no-requests">
              <Translate name="noRequests" prefix="homes.list." />
            </div>
          ) : (
            <List>
              {homeMembers
                .filter((m) => !m.UserHome.accepted)
                .map((m, i) => (
                  <ListItem key={`r-${i}`} uid={m.id}>
                    <ListItemLeft key={`rl-${i}`}>
                      <div className="img-text" key={`rlp-${i}`}>
                        <FontAwesomeIcon
                          key={`rlpi-${i}`}
                          icon="user-circle"
                        ></FontAwesomeIcon>
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
  }

  function getFormattedMemberName(firstname: string, lastname: string) {
    return `${firstname.charAt(0).toUpperCase()}${firstname.slice(1)} ${lastname
      .charAt(0)
      .toUpperCase()}.`;
  }

  async function deleteMemberState(id: number) {
    let m = getCopyIndex(members, (m: HomeMember) => m.id == id);
    if (m) {
      m.cp.splice(m.i, 1);
      setMembers(m.cp);
    }
  }

  function acceptMemberState(id: number) {
    let m = getCopyIndex(members, (m: HomeMember) => m.id == id);
    if (m) {
      m.cp[m.i].UserHome.accepted = true;
      setMembers(m.cp);
    }
  }

  function deleteMember(event: any, memberId: number) {
    axios
      .delete(`/homes/${props.home?.refNumber}/members/remove/${memberId}`)
      .then((res: any) => {
        deleteMemberState(memberId);
      })
      .catch((err) => {
        setErrorNotification(err.response.data);
      });
  }

  function acceptRequest(event: any, accept: boolean, memberId: number) {
    axios
      .post(
        `/homes/${props.home.refNumber}/request/${
          accept ? 'accept' : 'reject'
        }/${memberId}`
      )
      .then(async (res: any) => {
        if (accept) acceptMemberState(memberId);
        else deleteMemberState(memberId);
      })
      .catch((err) => {
        setErrorNotification(err.response.data);
      });
  }

  // #region Name

  function onChange(event: any) {
    setName(event.target.value);
  }

  function onSubmit() {
    if (!name || name.length === 0) {
      setError(true);
      setErrorNotification({
        title: 'newHome.missingName',
        msg: 'newHome.missingName',
      });
      return;
    }

    setError(false);
    props.onSubmit(name, props.home.refNumber);
  }

  // #endregion

  function toggleTab(name: string) {
    let t = getCopyIndex(tabs, (t) => t.name == name);
    if (t) {
      t.cp.forEach((t: { active: boolean }) => (t.active = false));
      t.cp[t.i].active = true;
      setTabs(t.cp);
    }
  }

  return members.length > 0 ? (
    <Popup
      onCancel={() => props.onCancel?.(props.home.refNumber)}
      onSubmit={onSubmit}
      onDelete={() => props.onDelete?.(props.home.refNumber)}
      type="edit"
    >
      <div className="form">
        <h1>Manage {props.home.UserHome.nickname ?? props.home.name}</h1>
        <SingleInputForm
          name="homes.name.renameHome"
          title="form.name"
          type="text"
          required={true}
          parent={{ onChange: onChange }}
          style={{ iconWidth: 36, tooltipMultiplier: 8 }}
          className="in-popup"
          error={error}
        ></SingleInputForm>
        <Toggle tabs={tabs} toggleTab={toggleTab} />
      </div>
    </Popup>
  ) : (
    <></>
  );
}
