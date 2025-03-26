import { Button, Form, Input, message, Select } from 'antd';
import { useState } from 'react';
import { Card } from '../../index';

const UserForm = ({
  title,
  initialValues = {},
  onSubmit,
  isRegisterForm,
  style,
}) => {
  const [loading, setLoading] = useState(false);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      await onSubmit(values);
    } catch (error) {
      message.error(error.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={title} style={style}>
      <Form
        name="userForm"
        layout="vertical"
        onFinish={handleFinish}
        autoComplete="off"
        initialValues={initialValues}
      >
        {isRegisterForm && (
          <Form.Item
            label="Business Name"
            name="businessName"
            rules={[
              { required: true, message: 'Please enter the business name!' },
            ]}
          >
            <Input placeholder="Enter business name" />
          </Form.Item>
        )}

        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please enter the name!' }]}
        >
          <Input placeholder="Enter name" />
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
          <Input placeholder="Enter email" />
        </Form.Item>

        {!isRegisterForm && (
          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Enter a role' }]}
          >
            <Input placeholder="Enter the role" />
          </Form.Item>
        )}

        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: 'Please enter a password!' },
            { min: 6, message: 'Password must be at least 6 characters long!' },
          ]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default UserForm;
