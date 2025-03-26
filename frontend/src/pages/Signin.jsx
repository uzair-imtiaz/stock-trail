import { useState } from 'react';
import { Form, Input, Button, message, Typography, Flex } from 'antd';
import { Card } from '../components/common';
import { Link, useNavigate } from 'react-router-dom';
import { signIn } from '../apis';
import cookies from 'js-cookie';
import loginIllustration from '../../public/assets/lotties/loginIllustration.json';
import Lottie from 'lottie-react';
import './signin.css';

const { Text } = Typography;

const SignIn = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = cookies.get('token');
  if (token) {
    navigate('/sales');
  }
  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const response = await signIn(values);
      if (response?.success) {
        message.success('Login successful!');
        onLogin(response.data);
        navigate('/sales');
      } else {
        message.error(response?.message || 'Something went wrong');
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-illustration">
        <Lottie animationData={loginIllustration} loop={true} autoplay={true} />
      </div>
      <Card title="Sign In" className="login-card">
        <Form
          name="signIn"
          layout="vertical"
          onFinish={handleFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                type: 'email',
                message: 'Please enter a valid email!',
              },
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter your password!' }]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Text>Don&apos;t have an account?</Text>{' '}
          <Link to="/register">
            <Button type="link">Sign Up</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default SignIn;
