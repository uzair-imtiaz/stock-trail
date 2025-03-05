import {
  Button,
  Flex,
  Table,
  Typography,
  Modal,
  Form,
  Input,
  message,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { IoAddOutline } from 'react-icons/io5';
import { EditOutlined } from '@ant-design/icons';
import { createExpense, getExpenses, updateExpense } from '../apis';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [form] = Form.useForm();

  const { Title } = Typography;

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await getExpenses();
      if (response?.success) {
        setExpenses(response?.data);
      } else {
        message.error(response?.message || 'Failed to fetch expenses');
      }
    } catch (error) {
      message.error(error?.message || 'An error occurred');
    }
  };

  const showAddModal = () => {
    setIsEditing(false);
    setCurrentExpense(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const showEditModal = (expense) => {
    setIsEditing(true);
    setCurrentExpense(expense);
    form.setFieldsValue({ name: expense.name });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      if (isEditing) {
        const response = await updateExpense(currentExpense._id, values);
        if (response?.success) {
          message.success('expense updated successfully');
          await fetchExpenses();
        } else {
          message.error(response?.message || 'Failed to update expense');
        }
      } else {
        const response = await createExpense(values);
        if (response?.success) {
          message.success('Expense added successfully');
          await fetchExpenses();
        } else {
          message.error(response?.message || 'Failed to add expense');
        }
      }
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error(error?.message || 'An error occurred');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          type="link"
          onClick={() => showEditModal(record)}
        />
      ),
    },
  ];

  return (
    <div style={{ width: '70%' }}>
      <Flex vertical style={{ width: '100%' }}>
        <Flex
          justify="space-between"
          align="center"
          style={{ marginBottom: '16px' }}
        >
          <Title level={3} style={{ margin: 0 }}>
            Expenses
          </Title>
          <Button
            icon={<IoAddOutline />}
            type="dashed"
            shape="circle"
            onClick={showAddModal}
          />
        </Flex>
        <Table
          columns={columns}
          dataSource={expenses}
          bordered
          style={{ width: '100%' }}
          rowKey="_id"
        />
      </Flex>

      <Modal
        title={isEditing ? 'Update Expense' : 'Add New Expense'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Expense Name"
            rules={[
              { required: true, message: 'Please enter the expense name' },
              { min: 2, message: 'Name must be at least 2 characters' },
            ]}
          >
            <Input placeholder="Enter expense name" />
          </Form.Item>
          <Form.Item>
            <Flex justify="end" gap="small">
              <Button onClick={handleCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {isEditing ? 'Update' : 'Add'}
              </Button>
            </Flex>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Expenses;
