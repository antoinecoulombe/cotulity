import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useTranslation } from 'react-i18next';
import axios from '../../utils/fetchClient';
import AppContainer from '../../components/app/appContainer';
import '../../assets/css/apps/groceries.css';

interface Event {
  id: number;
  description: string;
  date: Date;
}

const AppCalendar = (): JSX.Element => {
  const [events, setEvents] = useState<string>('');
  const { setNotification, setErrorNotification } = useNotifications();
  const { t } = useTranslation('common');

  const getEvents = (): void => {
    // axios
    //   .get(`/calendar/${localStorage.getItem('currentHome')}`)
    //   .then((res: any) => {
    //     if (res.data.events) setEvents(res.data.events);
    //     else setErrorNotification(res.data);
    //   })
    //   .catch((err) => {
    //     setNotification(err.response.data);
    //   });
  };

  useEffect(() => {
    getEvents();
  }, []);

  const onEventClick = () => {};

  const onEventSet = () => {};

  const onSelect = () => {};

  return (
    <AppContainer title="calendar" appName="calendar">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
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
