import { useEffect, useState } from 'react';
import { HomeMember } from '../../views/apps/homes';
import Dropdown, { DropdownOption } from '../forms/dropdown';
import Popup from '../utils/popup';
import SingleInputForm from '../forms/singleInputForm';
import DoubleInputTitle from '../forms/doubleInputTitle';
import Translate from '../utils/translate';

interface Transfer {
  amount?: number;
  date?: string;
  User?: HomeMember;
}

interface EditPopupProps {
  users: HomeMember[];
  onCancel(...attr: any): any;
  onSubmit(...attr: any): any;
}

interface TransferErrors {
  amount: boolean;
  date: boolean;
  User: boolean;
}

const initTransfer: Transfer = {
  amount: undefined,
  date: '/',
  User: undefined,
};

const initTransferErrors: TransferErrors = {
  amount: false,
  date: false,
  User: false,
};

const EditPopup = (props: EditPopupProps): JSX.Element => {
  const [transfer, setTransfer] = useState<Transfer>({ ...initTransfer });

  const [errors, setErrors] = useState<TransferErrors>(initTransferErrors);

  useEffect(() => {}, []);

  const onSubmit = (): void => {
    let newErrors = { ...initTransferErrors };

    let date = getDate(transfer.date);

    if (!transfer.amount || isNaN(transfer.amount)) newErrors.amount = true;
    if (!transfer.User) newErrors.User = true;
    if (date.day.length == 0 || date.month.length == 0) newErrors.date = true;

    setErrors(newErrors);

    for (const prop in newErrors) if (newErrors[prop]) return;
    props.onSubmit(transfer);
  };

  const getDate = (
    dateTime?: string
  ): {
    day: string;
    month: string;
  } => {
    try {
      if (!dateTime) throw 'Date undefined';

      let split = dateTime.split('/');
      return { day: split[0], month: split[1] };
    } catch (error) {
      return { day: '', month: '' };
    }
  };

  const InputToDate = (e: any, field: string, date: string): string | null => {
    var newDate: string = '';
    switch (field) {
      case 'day':
        if (e.target.value > 31) return null;
        newDate = e.target.value + date.substring(date.indexOf('/'));
        break;
      case 'month':
        if (e.target.value > 12) return null;
        newDate = date.substring(0, date.indexOf('/') + 1);
        newDate += e.target.value;
        break;
    }
    return newDate;
  };

  const setDate = (e: any, field: string): boolean => {
    if (e.target.value.length > 2) return false;
    let newDate = InputToDate(e, field, transfer.date ?? '');
    if (!newDate || !newDate.length) return false;
    setTransfer({ ...transfer, date: newDate });
    return true;
  };

  const handleAmount = (e: any): void => {
    setTransfer({
      ...transfer,
      amount: e.target.value,
    });
  };

  const handleRecipient = (selected: DropdownOption): void => {
    let newTransfer = { ...transfer };
    newTransfer.User = props.users.find((u) => u.id === selected.id);
    setTransfer(newTransfer);
  };

  return (
    <Popup
      onCancel={() => props.onCancel?.()}
      onSubmit={onSubmit}
      type="edit"
      new={true}
    >
      <div className="form">
        <h1>
          <Translate name="create" prefix="transfers.title." />
        </h1>
        <Dropdown
          name="transfers.name.recipient"
          title="transfers.title.recipient"
          options={props.users.map((u: any) => {
            return {
              id: u.id,
              value: `${u.firstname} ${u.lastname}`,
              selected: false,
              img: u.Image?.url ?? undefined,
              icon:
                (u.Image?.url ?? undefined) === undefined
                  ? 'user-circle'
                  : undefined,
            };
          })}
          onSelect={(selected) => handleRecipient(selected)}
          className={`in-popup`}
          required={true}
          error={errors.User}
        />
        <SingleInputForm
          name="transfers.name.amount"
          title="transfers.title.amount"
          type="text"
          required={true}
          value={transfer.amount?.toString()}
          parent={{
            onChange: (e: any) => handleAmount(e),
          }}
          onlyNumbers={true}
          iconStyle={{ iconWidth: 36, tooltipMultiplier: 8 }}
          className="in-popup half double with-d-squared"
          error={errors.amount}
        ></SingleInputForm>
        <DoubleInputTitle
          name={['tasks.name.date.dd', 'tasks.name.date.mm']}
          title="transfers.title.date"
          required={true}
          type="text"
          values={{
            first: getDate(transfer.date).day,
            second: getDate(transfer.date).month,
          }}
          onChange={(e: any, input: number) =>
            setDate(e, input === 1 ? 'day' : 'month')
          }
          onlyNumbers={true}
          className="in-popup half squared-inputs right"
          error={errors.date}
        ></DoubleInputTitle>
      </div>
    </Popup>
  );
};

export default EditPopup;
