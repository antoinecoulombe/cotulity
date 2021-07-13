import React, { useState } from 'react';
import '../../assets/css/open-app.css';
import IconToolTip from '../utils/iconTooltip';
import Header from './Header';
import SubHeader from './subHeader';

interface AppContainerProps {
  children: object;
  appName: string;
  title: string;
  subHeader?: {
    tabs: Array<{ name: string; action: () => void; selected?: boolean }>;
    orderBy?: Array<{ name: string; action: () => void }>;
    filters?: Array<{ name: string; action: () => void }>;
  };
  popup?: JSX.Element;
  onAddClick?: (e: any) => void;
}

export default function AppContainer(props: AppContainerProps) {
  return (
    <div className={`open-app-container ${props.appName}`}>
      {props.popup}
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
