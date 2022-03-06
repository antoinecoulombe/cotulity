import { useEffect, useState } from 'react';
import { initTask, Task } from '../../views/apps/tasks';
import { useTranslation } from 'react-i18next';
import Dropdown, { DropdownOption } from '../forms/dropdown';
import Popup from '../utils/popup';
import SingleInputForm from '../forms/singleInputForm';
import DoubleInputTitle from '../forms/doubleInputTitle';
import Translate from '../utils/translate';
import IconToolTip from '../global/iconTooltip';

interface EditPopupProps {
  task?: Task;
  users: Array<DropdownOption>;
  onCancel(...attr: any): any;
  onSubmit(...attr: any): any;
  onDelete?(...attr: any): any;
}

const EditPopup = (props: EditPopupProps): JSX.Element => {
  const { t } = useTranslation('common');

  // Input format: 2021-08-18T08:26:21.000Z
  const handleDate = (date: string): string => {
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
  };

  const [task, setTask] = useState<Task>(
    props.task
      ? { ...props.task, dueDateTime: handleDate(props.task.dueDateTime) }
      : initTask
  );

  useEffect(() => {}, []);

  // const onChange = (event: any) => {
  //   setName(event.target.value);
  // };

  const toggleSwitch = (field: string): void => {
    if (field === 'important') setTask({ ...task, important: !task.important });
    else if (field === 'shared') {
      setTask({ ...task, shared: !task.shared });
    }
  };

  const onSubmit = (): void => {
    props.onSubmit(task);
  };

  const getDateTime = (): {
    day: string;
    month: string;
    hour: string;
    minute: string;
  } => {
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
  };

  const InputToDateTime = (e: any, field: string): string | null => {
    var newDate: string = '';
    switch (field) {
      case 'day':
        if (e.target.value > 31) return null;
        newDate =
          e.target.value +
          task.dueDateTime.substring(task.dueDateTime.indexOf('/'));
        break;
      case 'month':
        if (e.target.value > 12) return null;
        newDate = task.dueDateTime.substring(
          0,
          task.dueDateTime.indexOf('/') + 1
        );
        newDate += e.target.value;
        newDate += task.dueDateTime.substring(task.dueDateTime.indexOf('@'));
        break;
      case 'hour':
        if (e.target.value > 23) return null;
        newDate = task.dueDateTime.substring(
          0,
          task.dueDateTime.indexOf('@') + 1
        );
        newDate += e.target.value;
        newDate += task.dueDateTime.substring(task.dueDateTime.indexOf(':'));
        break;
      case 'minute':
        if (e.target.value > 59) return null;
        newDate = task.dueDateTime.substring(
          0,
          task.dueDateTime.indexOf(':') + 1
        );
        newDate += e.target.value;
        break;
    }
    return newDate;
  };

  const setDateTime = (e: any, field: string): boolean => {
    if (e.target.value.length > 2) return false;
    let newDate = InputToDateTime(e, field);
    if (!newDate) return false;
    setTask({ ...task, dueDateTime: newDate });
    return true;
  };

  const handleUserSelect = (selected: DropdownOption[]): void => {
    let newTask = { ...task };
    newTask.Users = selected.map((us) => {
      return {
        id: us.id,
        firstname: us.value.split(' ')[0],
        lastname: us.value.split(' ')[1],
        Image: !us.img ? null : { url: us.img },
      };
    });
    setTask(newTask);
  };

  const handleRepeatSelect = (selected: DropdownOption[]): void => {
    // TODO: handle dropdown
  };

  return (
    <Popup
      onCancel={() => props.onCancel?.()}
      onSubmit={onSubmit}
      onDelete={props.task ? () => props.onDelete?.(props.task?.id) : undefined}
      type="edit"
      new={props.task === undefined}
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
          onSelect={(selected) => handleUserSelect(selected)}
          onSelectTransform={(value: string) => {
            let split = value.split(' ');
            return `${split[0]} ${split[1][0].toUpperCase()}.`;
          }}
          className="in-popup"
          required={task.shared}
          disabled={!task.shared}
        ></Dropdown>
        <Dropdown
          name="tasks.name.repeat.none"
          title="tasks.title.repeat"
          options={[
            t('tasks.name.repeat.none'),
            t('tasks.name.repeat.day'),
            t('tasks.name.repeat.week'),
            t('tasks.name.repeat.twoweek'),
            t('tasks.name.repeat.month'),
          ]}
          onSelect={(selected) => handleRepeatSelect(selected)}
          className="in-popup"
          required={true}
        ></Dropdown>
        <DoubleInputTitle
          name={['tasks.name.date.dd', 'tasks.name.date.mm']}
          title="tasks.title.until"
          required={true}
          type="text"
          values={{ first: getDateTime().day, second: getDateTime().month }}
          onChange={(e: any, input: number) =>
            setDateTime(e, input === 1 ? 'day' : 'month')
          }
          className="in-popup half squared-inputs"
        ></DoubleInputTitle>
        <DoubleInputTitle
          name={['tasks.name.date.dd', 'tasks.name.date.mm']}
          title="tasks.title.dueDate"
          required={true}
          type="text"
          values={{ first: getDateTime().day, second: getDateTime().month }}
          onChange={(e: any, input: number) =>
            setDateTime(e, input === 1 ? 'day' : 'month')
          }
          className="in-popup half squared-inputs"
        ></DoubleInputTitle>
        <DoubleInputTitle
          name={['tasks.name.date.hh', 'tasks.name.date.mm']}
          title="tasks.title.dueTime"
          type="text"
          values={{ first: getDateTime().hour, second: getDateTime().minute }}
          onChange={(e: any, input: number) =>
            setDateTime(e, input === 1 ? 'hour' : 'minute')
          }
          className="in-popup half squared-inputs"
        ></DoubleInputTitle>
        <div className="switch">
          <h2>
            <Translate name="important" prefix="tasks.title." />
          </h2>
          <div className="input-toggle">
            <div className="generic-input">
              <input
                id="theme-switch"
                type="checkbox"
                className="switch"
                defaultChecked={task.important}
                onClick={() => toggleSwitch('important')}
              />
              {task.important && (
                <IconToolTip
                  icon="exclamation-circle"
                  style={{ iconWidth: 23, tooltipMultiplier: 10 }}
                  error={true}
                  className="after-switch"
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
          <div className="input-toggle disabled">
            <div className="generic-input disabled">
              <input
                id="theme-switch"
                type="checkbox"
                className="switch"
                defaultChecked={task.shared}
                disabled={
                  task.id !== -1 &&
                  task.Owner?.id !==
                    parseInt(localStorage.getItem('userId') ?? '-1')
                }
                onClick={() => toggleSwitch('shared')}
              />
            </div>
          </div>
        </div>
      </div>
    </Popup>
  );
};

export default EditPopup;
