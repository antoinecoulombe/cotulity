import NewPasswordForm from '../components/account/newPassword';
import '../assets/css/views/login.css';

const PasswordEditPage = (): JSX.Element => {
  return (
    <>
      <div id="container">
        <NewPasswordForm />
      </div>
      <div className="logo medium"></div>
    </>
  );
};

export default PasswordEditPage;
