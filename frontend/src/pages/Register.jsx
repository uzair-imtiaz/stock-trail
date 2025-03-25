import { message, Typography } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp } from '../apis';
import UserForm from '../components/common/forms/user-form/user-form';

const { Text } = Typography;

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

  return <UserForm title="Sign Up" onSubmit={handleFinish} isRegisterForm />;
};

export default Register;
