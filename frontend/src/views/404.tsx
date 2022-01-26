import { Link } from 'react-router-dom';
import { isAuthenticated } from '../utils/global';
import Translate from '../components/utils/translate';
import '../assets/css/views/404.css';

export default function NotFoundPage() {
  return (
    <div className="container-404">
      <h1>404</h1>
      <h2>
        <i>Uh-Oh! </i>
        <Translate name="title" prefix="notFound."></Translate> <br />
        <Link to={isAuthenticated() ? '/apps' : '/'}>
          <Translate name="link" prefix="notFound."></Translate>
        </Link>
        .
      </h2>
    </div>
  );
}
