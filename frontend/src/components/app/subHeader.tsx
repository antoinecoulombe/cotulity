import { faTablets } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from 'react';
import '../../assets/css/open-app.css';
import IconToolTip from '../utils/iconTooltip';
import Translate from '../utils/translate';

interface SubHeaderProps {
  tabs: Array<{ name: string; action: () => void; selected?: boolean }>;
  orderBy?: Array<{ name: string; action: () => void }>;
  filters?: Array<{ name: string; action: () => void }>;
}

export default function SubHeader(props: SubHeaderProps) {
  return (
    <div className="sub-header">
      <div className="tabs">
        {props.tabs.map((t) => (
          <h2
            className={t.selected ? 'selected' : ''}
            onClick={t.action}
            key={t.name}
          >
            <Translate name={t.name} prefix="subHeader."></Translate>
          </h2>
        ))}
      </div>

      <div className="options">
        <h2>
          <Translate name="orderBy" prefix="subHeader."></Translate>
        </h2>
        {/* TODO: ORDER BY DROPDOWN */}
        <h2>
          <Translate name="filters" prefix="subHeader."></Translate>
        </h2>
        {/* TODO: FILTERS DROPDOWN */}
      </div>
    </div>
  );
}
