import { useTranslation } from 'react-i18next';

export interface TranslateProps {
  name: string;
  prefix?: string;
  suffix?: string;
  spaceBefore?: boolean;
  spaceAfter?: boolean;
}

const Translate = (props: TranslateProps): JSX.Element => {
  const { t } = useTranslation('common');

  function format(string: string, params: string[]) {
    var str = string;

    for (var i = 0; i < arguments[1].length; i++) {
      var regEx = new RegExp('\\{' + i + '\\}', 'gm');
      str = str.replace(regEx, params[i]);
    }

    return str;
  }

  let translated: string;
  try {
    let json = JSON.parse(props.name);
    translated = format(
      t((props.prefix ?? '') + json.translate + (props.suffix ?? '')),
      json.format
    );
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
};

export default Translate;
