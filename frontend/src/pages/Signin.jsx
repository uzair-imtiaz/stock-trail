import { useState } from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import { Card } from '../components/common';
import { Link, useNavigate } from 'react-router-dom';
import { signIn } from '../apis';

const { Text } = Typography;

const SignIn = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const response = await signIn(values);
      if (response?.success) {
        message.success('Login successful!');
        onLogin(response.data);
        navigate('/');
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
    <Card
      title="Sign In"
      style={{ maxWidth: 400, margin: 'auto', marginTop: '100px' }}
    >
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
  );
};

export default SignIn;
