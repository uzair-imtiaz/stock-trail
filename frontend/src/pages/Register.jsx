import { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from '../apis';

const { Text } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const response = await signUp({ ...values, role: 'user' });
      if (response?.success) {
        message.success('Registration successful! You can now sign in.');
        navigate('/signin');
      } else {
        message.error(response?.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Sign Up"
      style={{ maxWidth: 400, margin: 'auto', marginTop: '100px' }}
    >
      <Form
        name="signUp"
        layout="vertical"
        onFinish={handleFinish}
        autoComplete="off"
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please enter your name!' }]}
        >
          <Input placeholder="Enter your name" />
        </Form.Item>

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
          rules={[
            { required: true, message: 'Please enter your password!' },
            { min: 6, message: 'Password must be at least 6 characters long!' },
          ]}
        >
          <Input.Password placeholder="Enter your password" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Sign Up
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Text>Already have an account?</Text>{' '}
        <Link to="/signin">
          <Button type="link">Sign In</Button>
        </Link>
      </div>
    </Card>
  );
};

export default Register;
