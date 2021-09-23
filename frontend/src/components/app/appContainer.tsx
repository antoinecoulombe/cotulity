import { useEffect, useRef } from 'react';
import SubHeader, { SubHeaderProps } from './subHeader';
import Sidebar, { SidebarTab } from './sidebar';
import { useOutsideAlerter } from '../utils/outsideClick';
import { useHistory } from 'react-router';
import Header from './header';
import $ from 'jquery';
import '../../assets/css/open-app.css';

interface AppContainerProps {
  children: object;
  appName: string;
  title: string;
  subHeader?: SubHeaderProps;
  sidebar?: SidebarTab[];
  popup?: JSX.Element;
  bodyMinHeight?: number;
  onAddClick?: (e: any) => void;
}

export function handleOpenAppResize(bodyMinHeight?: number) {
  let appH =
    ($(window)?.height() ?? 0) * 0.7 -
    (($('.open-app-container')?.outerWidth() ?? 0) -
      ($('.open-app-container')?.innerWidth() ?? 0)) *
      2;
  if (appH) {
    appH -=
      $('.open-app-container > .headers > .header')?.outerHeight(true) ?? 0;
    appH -=
      $('.open-app-container > .headers > .sub-header')?.outerHeight(true) ?? 0;

    let noFill = $('.open-app-container > .app-body > *:not(.fill-height)');
    for (let i = 0; i < noFill.length; ++i)
      appH -= $(noFill[i])?.outerHeight(true) ?? 0;

    if (bodyMinHeight && appH < bodyMinHeight) appH = bodyMinHeight;
    $('.open-app-container .fill-height').css({ maxHeight: appH + 'px' });
  }
}

export default function AppContainer(props: AppContainerProps) {
  const history = useHistory();

  useEffect(() => {
    window.addEventListener('resize', () =>
      handleOpenAppResize(props.bodyMinHeight)
    );
    return () =>
      window.removeEventListener('resize', () =>
        handleOpenAppResize(props.bodyMinHeight)
      );
  }, []);

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => history.push('/apps'));

  return (
    <div ref={wrapperRef} className={`open-app-container ${props.appName}`}>
      {props.popup}
      {props.sidebar && <Sidebar tabs={props.sidebar} />}
      <div className="headers">
        <Header
          appName={props.appName}
          title={props.title}
          onAddClick={props.onAddClick}
        ></Header>
        {props.subHeader && (
          <SubHeader
            tabs={props.subHeader.tabs}
            orderBy={props.subHeader.orderBy}
            filters={props.subHeader.filters}
          ></SubHeader>
        )}
      </div>
      <div className="app-body">{props.children}</div>
    </div>
  );
}
