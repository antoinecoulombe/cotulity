import React, { useEffect, useState } from 'react';
import { useNotifications } from '../../contexts/NotificationsContext';
import { Task } from '../../views/apps/tasks';
import Popup from '../utils/popup';
import SingleInputForm from '../forms/singleInputForm';
import DoubleInputForm from '../forms/doubleInputForm';
import axios from '../../utils/fetchClient';
import _ from 'lodash';
import Translate from '../utils/translate';
import IconToolTip from '../global/iconTooltip';

interface EditPopupProps {
  task?: Task;
  onCancel(...attr: any): any;
  onSubmit(...attr: any): any;
  updateMemberCount(...attr: any): any;
  onDelete?(...attr: any): any;
}

export default function EditPopup(props: EditPopupProps) {
  const { setNotification, setErrorNotification } = useNotifications();
  const [name, setName] = useState<string>();
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {}, []);

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
    // props.onSubmit(name, props.home.refNumber);
  }

  return (
    <Popup
      onCancel={() => props.onCancel?.()}
      onSubmit={onSubmit}
      onDelete={() => props.onDelete?.()}
      type="edit"
    >
      <div className="form">
        <h1>Manage Task</h1>
        <SingleInputForm
          name="tasks.name.taskDesc"
          title="form.name"
          type="text"
          required={true}
          parent={{ onChange: onChange }}
          style={{ iconWidth: 36, tooltipMultiplier: 8 }}
          className="in-popup"
          error={error}
        ></SingleInputForm>
        <SingleInputForm
          name="tasks.name.participants"
          title="tasks.title.participants"
          type="text"
          parent={{ onChange: onChange }}
          style={{ iconWidth: 36, tooltipMultiplier: 8 }}
          className="in-popup"
          error={error}
        ></SingleInputForm>
        <DoubleInputForm
          name={['tasks.name.date.dd', 'tasks.name.date.mm']}
          title="tasks.title.dueDate"
          required={true}
          type="text"
          parent={{ onChange: onChange }}
          style={{ iconWidth: 36, tooltipMultiplier: 8 }}
          className="in-popup half"
          error={error}
          squaredInputs={true}
        ></DoubleInputForm>
        <DoubleInputForm
          name={['tasks.name.date.hh', 'tasks.name.date.mm']}
          title="tasks.title.dueTime"
          type="text"
          parent={{ onChange: onChange }}
          style={{ iconWidth: 36, tooltipMultiplier: 8 }}
          className="in-popup half"
          error={error}
          squaredInputs={true}
        ></DoubleInputForm>
        <div className="switch">
          <h2>
            <Translate name="important" prefix="tasks.title." />
          </h2>
          <div className="input-toggle">
            <div className="generic-input">
              {props.task?.important ? (
                <input
                  id="theme-switch"
                  type="checkbox"
                  className="switch"
                  defaultChecked
                  onClick={() => {}}
                />
              ) : (
                <input
                  id="theme-switch"
                  type="checkbox"
                  className="switch"
                  onClick={() => {}}
                />
              )}
            </div>
          </div>
        </div>
        <div className="switch help last">
          <h2>
            <b>
              <Translate name="shared" prefix="tasks.title." />
            </b>
            <IconToolTip
              icon="question-circle"
              style={{ iconWidth: 23, tooltipMultiplier: 10 }}
            >
              tasks.tooltip.shared
            </IconToolTip>
          </h2>
          <div className="input-toggle">
            <div className="generic-input">
              {props.task?.shared ? (
                <input
                  id="theme-switch"
                  type="checkbox"
                  className="switch"
                  defaultChecked
                  onClick={() => {}}
                />
              ) : (
                <input
                  id="theme-switch"
                  type="checkbox"
                  className="switch"
                  onClick={() => {}}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Popup>
  );
}
