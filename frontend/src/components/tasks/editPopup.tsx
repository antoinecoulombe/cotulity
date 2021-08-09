import React, { useEffect, useState } from 'react';
import { useNotifications } from '../../contexts/NotificationsContext';
import { HomeMember, initTask, Task } from '../../views/apps/tasks';
import Popup from '../utils/popup';
import SingleInputForm from '../forms/singleInputForm';
import DoubleInputTitle from '../forms/doubleInputTitle';
import axios from '../../utils/fetchClient';
import _ from 'lodash';
import Translate from '../utils/translate';
import IconToolTip from '../global/iconTooltip';
import Dropdown, { DropdownOption } from '../forms/dropdown';

interface EditPopupProps {
  task?: Task;
  users: Array<DropdownOption>;
  onCancel(...attr: any): any;
  onSubmit(...attr: any): any;
  onDelete?(...attr: any): any;
}
export default function EditPopup(props: EditPopupProps) {
  const { setNotification, setErrorNotification } = useNotifications();
  const [task, setTask] = useState<Task>(
    props.task
      ? { ...props.task, dueDateTime: handleDate(props.task.dueDateTime) }
      : initTask
  );

  // Input format: 2021-08-18T08:26:21.000Z
  function handleDate(date: string): string {
    let split = date.split('T');
    let handledDate = '';
    handledDate += split[0].substring(split[0].lastIndexOf('-') + 1) + '/';
    handledDate +=
      split[0].substring(split[0].indexOf('-') + 1, split[0].lastIndexOf('-')) +
      '@';
    handledDate += split[1].substring(0, split[1].indexOf(':')) + ':';
    handledDate += split[1].substring(
      split[1].indexOf(':') + 1,
      split[1].lastIndexOf(':')
    );
    return handledDate;
  }

  useEffect(() => {}, []);

  function onChange(event: any) {
    // setName(event.target.value);
  }

  function toggleSwitch(field: string) {
    if (field == 'important') setTask({ ...task, important: !task.important });
    else if (field == 'shared') {
      setTask({ ...task, shared: !task.shared });
    }
  }

  function onSubmit() {
    props.onSubmit(task);
  }

  function getDateTime() {
    let split = task.dueDateTime.split('@');
    var day: string, month: string, hour: string, minute: string;
    if (split[0].length > 1) {
      day = split[0].substring(0, split[0].indexOf('/'));
      month = split[0].substring(split[0].indexOf('/') + 1);
    } else {
      day = '';
      month = '';
    }

    if (split[1].length > 1) {
      hour = split[1].substring(0, split[1].indexOf(':'));
      minute = split[1].substring(split[1].indexOf(':') + 1);
    } else {
      hour = '';
      minute = '';
    }
    return { day: day, month: month, hour: hour, minute: minute };
  }

  function setDateTime(e: any, field: string) {
    if (e.target.value.length > 2) return false;

    var newDate: string = '';
    switch (field) {
      case 'day':
        if (e.target.value > 31) return false;
        newDate =
          e.target.value +
          task.dueDateTime.substring(task.dueDateTime.indexOf('/'));
        break;
      case 'month':
        if (e.target.value > 12) return false;
        newDate = task.dueDateTime.substring(
          0,
          task.dueDateTime.indexOf('/') + 1
        );
        newDate += e.target.value;
        newDate += task.dueDateTime.substring(task.dueDateTime.indexOf('@'));
        break;
      case 'hour':
        if (e.target.value > 23) return false;
        newDate = task.dueDateTime.substring(
          0,
          task.dueDateTime.indexOf('@') + 1
        );
        newDate += e.target.value;
        newDate += task.dueDateTime.substring(task.dueDateTime.indexOf(':'));
        break;
      case 'minute':
        if (e.target.value > 59) return false;
        newDate = task.dueDateTime.substring(
          0,
          task.dueDateTime.indexOf(':') + 1
        );
        newDate += e.target.value;
        break;
    }
    setTask({ ...task, dueDateTime: newDate });
    return true;
  }

  return (
    <Popup
      onCancel={() => props.onCancel?.()}
      onSubmit={onSubmit}
      onDelete={props.task ? () => props.onDelete?.(props.task?.id) : undefined}
      type="edit"
      new={props.task == undefined}
    >
      <div className="form">
        <h1>
          <Translate
            name={props.task ? 'manage' : 'create'}
            prefix="tasks.title."
          />
        </h1>
        <SingleInputForm
          name="tasks.name.taskDesc"
          title="form.name"
          type="text"
          required={true}
          value={task.name}
          parent={{
            onChange: (e: any) => setTask({ ...task, name: e.target.value }),
          }}
          style={{ iconWidth: 36, tooltipMultiplier: 8 }}
          className="in-popup"
        ></SingleInputForm>
        <Dropdown
          name="tasks.name.participants"
          title="tasks.title.participants"
          options={props.users}
          onSelect={() => {}}
          onSelectTransform={(value: string) => {
            let split = value.split(' ');
            return `${split[0]} ${split[1][0].toUpperCase()}.`;
          }}
          className="in-popup"
          required={task.shared}
          disabled={!task.shared}
        ></Dropdown>
        <DoubleInputTitle
          name={['tasks.name.date.dd', 'tasks.name.date.mm']}
          title="tasks.title.dueDate"
          required={true}
          type="text"
          values={{ first: getDateTime().day, second: getDateTime().month }}
          onChange={(e: any, input: number) =>
            setDateTime(e, input == 1 ? 'day' : 'month')
          }
          className="in-popup half squared-inputs"
        ></DoubleInputTitle>
        <DoubleInputTitle
          name={['tasks.name.date.hh', 'tasks.name.date.mm']}
          title="tasks.title.dueTime"
          type="text"
          values={{ first: getDateTime().hour, second: getDateTime().minute }}
          onChange={(e: any, input: number) =>
            setDateTime(e, input == 1 ? 'hour' : 'minute')
          }
          className="in-popup half squared-inputs"
        ></DoubleInputTitle>
        <div className="switch">
          <h2>
            <Translate name="important" prefix="tasks.title." />
          </h2>
          <div className="input-toggle">
            <div className="generic-input">
              {task.important ? (
                <>
                  <input
                    id="theme-switch"
                    type="checkbox"
                    className="switch"
                    defaultChecked
                    onClick={() => toggleSwitch('important')}
                  />
                  <IconToolTip
                    icon="exclamation-circle"
                    style={{ iconWidth: 23, tooltipMultiplier: 10 }}
                    error={true}
                    className="after-switch"
                  />
                </>
              ) : (
                <input
                  id="theme-switch"
                  type="checkbox"
                  className="switch"
                  onClick={() => toggleSwitch('important')}
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
              {task.shared ? (
                <input
                  id="theme-switch"
                  type="checkbox"
                  className="switch"
                  defaultChecked
                  onClick={() => toggleSwitch('shared')}
                />
              ) : (
                <input
                  id="theme-switch"
                  type="checkbox"
                  className="switch"
                  onClick={() => toggleSwitch('shared')}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Popup>
  );
}
