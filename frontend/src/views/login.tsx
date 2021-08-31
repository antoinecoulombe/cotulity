import LoginForm from '../components/login/loginForm';
import '../assets/css/login.css';

export default function LoginPage() {
  return (
    <>
      <div id="container">
        <LoginForm />
      </div>
      <div className="logo big"></div>
    </>
  );
}
