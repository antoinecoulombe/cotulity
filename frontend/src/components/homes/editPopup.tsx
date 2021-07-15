import React, { useEffect, useState } from 'react';
import $ from 'jquery';
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
import Toggle from '../global/toggle';
import { Home } from '../../views/apps/homes';
import { useNotifications } from '../../contexts/NotificationsContext';

interface HomeMembers {
  Members: Array<{
    id: number;
    firstname: string;
    lastname: string;
    image?: string;
    UserHome: { nickname?: string; accepted: boolean };
  }>;
}

interface EditPopupProps {
  onCancel(...attr: any): any;
  onSubmit(...attr: any): any;
  onDelete?(...attr: any): any;
  home: Home & HomeMembers;
}

export default function EditPopup(props: EditPopupProps) {
  const { setErrorNotification } = useNotifications();
  const [name, setName] = useState<string>();
  const [error, setError] = useState<boolean>(false);

  function getFormattedMemberName(firstname: string, lastname: string) {
    return `${firstname.charAt(0).toUpperCase()}${firstname.slice(1)} ${lastname
      .charAt(0)
      .toUpperCase()}.`;
  }

  function rejectRequest(event: any) {}

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

  return (
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
        <Toggle
          tabs={[
            {
              name: 'members',
              prefix: 'homes.list.',
              active: true,
              body: (
                <List>
                  {props.home.Members.filter((m) => m.UserHome.accepted).map(
                    (m) => (
                      <ListItem key={m.id} uid={m.id}>
                        <ListItemLeft>
                          <div className="img-text">
                            {props.home.ownerId !== m.id && (
                              <IconToolTip
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
                                onClick={rejectRequest}
                              >
                                {ReactDOMServer.renderToStaticMarkup(
                                  <Translate
                                    name="kickMember"
                                    prefix="homes.tooltip."
                                  ></Translate>
                                )}
                              </IconToolTip>
                            )}
                            <FontAwesomeIcon icon="user-circle"></FontAwesomeIcon>
                            <h3>
                              {getFormattedMemberName(m.firstname, m.lastname)}
                            </h3>
                          </div>
                        </ListItemLeft>
                        {props.home.ownerId === m.id && (
                          <ListItemRight>
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
                    )
                  )}
                </List>
              ),
            },
            {
              name: 'requests',
              prefix: 'homes.list.',
              body:
                props.home.Members.filter((m) => !m.UserHome.accepted).length ==
                0 ? (
                  <div className="no-requests">
                    <Translate name="noRequests" prefix="homes.list." />
                  </div>
                ) : (
                  <List>
                    {props.home.Members.filter((m) => !m.UserHome.accepted).map(
                      (m) => (
                        <ListItem key={m.id} uid={m.id}>
                          <ListItemLeft>
                            <div className="img-text">
                              <FontAwesomeIcon icon="user-circle"></FontAwesomeIcon>
                              <h3>
                                {getFormattedMemberName(
                                  m.firstname,
                                  m.lastname
                                )}
                              </h3>
                            </div>
                          </ListItemLeft>
                          <ListItemRight>
                            <IconToolTip
                              icon="trash"
                              style={{ iconWidth: 30, tooltipMultiplier: 5 }}
                              circled={{ value: true, multiplier: 0.45 }}
                              error={true}
                              onClick={rejectRequest}
                            >
                              {ReactDOMServer.renderToStaticMarkup(
                                <Translate
                                  name="decline"
                                  prefix="nav."
                                ></Translate>
                              )}
                            </IconToolTip>
                            <button className="accept">
                              <p>
                                <Translate
                                  name="accept"
                                  prefix="nav."
                                ></Translate>
                              </p>
                            </button>
                          </ListItemRight>
                        </ListItem>
                      )
                    )}
                  </List>
                ),
            },
          ]}
        />
      </div>
    </Popup>
  );
}
