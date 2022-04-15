import { useEffect, useState } from 'react';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useTranslation } from 'react-i18next';
import { HomeMember } from './homes';
import axios from '../../utils/fetchClient';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import AppContainer from '../../components/app/appContainer';
import '../../assets/css/apps/calendar.css';
import EditPopup from '../../components/calendar/editPopup';
import { DropdownMultiOption } from '../../components/forms/dropdownMulti';

export interface CalendarEvent {
  id: number;
  name: string;
  shared: boolean;
  repeat: string;
  untilDate: string;
  Events: CalendarEventOccurence[];
  Owner?: HomeMember;
}

export interface CalendarEventOccurence {
  id: number;
  location: string;
  notes: string;
  start: string;
  end: string;
  duration: number;
  Event: CalendarEvent;
  Users?: HomeMember[];
}

export const initCalendarEvent: CalendarEvent = {
  id: -1,
  name: '',
  shared: true,
  repeat: 'none',
  untilDate: '/@:',
  Events: [],
};

export const initCalendarEventOccurence: CalendarEventOccurence = {
  id: -1,
  location: '',
  notes: '',
  start: '/@:',
  end: '/@:',
  duration: 120,
  Event: initCalendarEvent,
  Users: [],
};

const nullJSX: JSX.Element = <></>;

const AppCalendar = (): JSX.Element => {
  const { setNotification, setErrorNotification } = useNotifications();
  const { t } = useTranslation('common');

  const [events, setEvents] = useState<string>('');
  const [popup, setPopup] = useState<JSX.Element>(nullJSX);
  const [users, setUsers] = useState<HomeMember[]>([]);

  const getEvents = (): void => {
    axios
      .get(`/calendar/${localStorage.getItem('currentHome')}/events`)
      .then((res: any) => {
        if (res.data.events && res.data.users) {
          setEvents(res.data.events);
          setUsers(res.data.users);
        } else setErrorNotification(res.data);
      })
      .catch((err) => {
        setNotification(err.response.data);
      });
  };

  useEffect(() => {
    getEvents();
  }, []);

  const handleSubmit = (event: CalendarEvent) => {};

  const deleteEvent = (id: number, closePopup?: boolean) => {};

  const showPopup = (event?: CalendarEventOccurence): void => {
    setPopup(
      <EditPopup
        onCancel={() => setPopup(nullJSX)}
        event={event}
        users={users.map((u) => {
          return {
            id: u.id,
            value: `${u.firstname} ${u.lastname}`,
            img: u.Image?.url ?? undefined,
            icon:
              (u.Image?.url ?? undefined) === undefined
                ? 'user-circle'
                : undefined,
            selected: !event
              ? false
              : (event.Users?.find((eu) => eu.id === u.id) ?? null) != null,
          } as DropdownMultiOption;
        })}
        onSubmit={(eventGroup: CalendarEvent) => handleSubmit(eventGroup)}
        onDelete={event ? (id: number) => deleteEvent(id, true) : undefined}
      />
    );
  };

  const onEventClick = () => {};

  const onEventSet = () => {};

  const onSelect = () => {};

  return (
    <AppContainer
      popup={popup}
      title="calendar"
      appName="calendar"
      onAddClick={() => showPopup(undefined)}
      bodyMinHeight={580}
    >
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={[
          {
            title: 'Class',
            start: new Date(),
            end: new Date().setHours(new Date().getHours() + 3),
          },
        ]}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        select={onSelect}
        eventClick={onEventClick}
        eventsSet={onEventSet}
      />
    </AppContainer>
  );
};

export default AppCalendar;
