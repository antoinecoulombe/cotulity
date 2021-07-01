import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Translate(obj: any) {
  const { t, i18n } = useTranslation('common');

  function format(string, params) {
    var str = string;

    for (var i = 0; i < arguments[1].length; i++) {
      var regEx = new RegExp('\\{' + i + '\\}', 'gm');
      str = str.replace(regEx, params[i]);
    }

    return str;
  }

  let translated;
  try {
    let json = JSON.parse(obj.name);
    translated = format(t(obj.prefix + json.translate), json.format);
  } catch (error) {
    translated = t((obj.prefix ?? '') + obj.name);
  }

  return (
    <>
      {obj.spaceBefore ? ' ' : ''}
      {translated}
      {obj.spaceAfter ? ' ' : ''}
    </>
  );
}
