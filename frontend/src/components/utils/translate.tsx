import React from 'react';
import { useTranslation } from 'react-i18next';

export interface TranslateProps {
  name: string;
  prefix?: string;
  suffix?: string;
  spaceBefore?: boolean;
  spaceAfter?: boolean;
}

export default function Translate(props: TranslateProps) {
  const { t, i18n } = useTranslation('common');

  function format(string: string, params: string[]) {
    var str = string;

    for (var i = 0; i < arguments[1].length; i++) {
      var regEx = new RegExp('\\{' + i + '\\}', 'gm');
      str = str.replace(regEx, params[i]);
    }

    return str;
  }

  let translated;
  try {
    let json = JSON.parse(props.name);
    translated = format(t(props.prefix + json.translate), json.format);
  } catch (error) {
    translated = t((props.prefix ?? '') + props.name + (props.suffix ?? ''));
  }

  return (
    <>
      {props.spaceBefore ? ' ' : ''}
      {translated}
      {props.spaceAfter ? ' ' : ''}
    </>
  );
}
