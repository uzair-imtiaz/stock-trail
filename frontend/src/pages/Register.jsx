import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { signUp } from '../apis';
import UserForm from '../components/common/forms/user-form/user-form';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import './register.css';

const Register = () => {
  const navigate = useNavigate();
  const handleFinish = async (values) => {
    try {
      const response = await signUp({ ...values });
      if (response?.success) {
        message.success('Registration successful! You can now sign in.');
        navigate('/signin');
      } else {
        message.error(response?.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-animation">
        <DotLottieReact
          loop
          autoplay
          src="/assets/lotties/OnBoardingAnimation.lottie"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <div className="signup-form-container">
        <UserForm title="Register your business" onSubmit={handleFinish} isRegisterForm style={{width: 480}} />
      </div>
    </div>
  );
};

export default Register;
