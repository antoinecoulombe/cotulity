import { useTranslation } from 'react-i18next';
import Translate from '../utils/translate';

interface SetLanguageProps {}

export default function SetLanguage(props: SetLanguageProps) {
  const [t, i18n] = useTranslation('common');

  function setLang(lang: string) {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  }

  return (
    <div className="setting">
      <div className="left">
        <h2>
          <Translate name="language" prefix="settings." />
        </h2>
      </div>
      <div className="right">
        {['fr', 'en'].map((lang, i) => (
          <h3
            key={i}
            onClick={() => setLang(lang)}
            className={localStorage.getItem('lang') === lang ? 'active' : ''}
          >
            {lang.toUpperCase()}
          </h3>
        ))}
      </div>
    </div>
  );
}
