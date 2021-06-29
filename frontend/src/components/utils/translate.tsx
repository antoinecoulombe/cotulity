import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Text(obj: any) {
  const { t, i18n } = useTranslation('common');
  return (
    <>
      {obj.spaceBefore ? ' ' : ''}
      {t(obj.name)}
      {obj.spaceAfter ? ' ' : ''}
    </>
  );
}
