import LoginForm from '../components/login/loginForm';
import '../assets/css/views/login.css';

const LoginPage = (): JSX.Element => {
  return (
    <>
      <div id="container">
        <LoginForm />
      </div>
      <div className="logo big"></div>
    </>
  );
};

export default LoginPage;
