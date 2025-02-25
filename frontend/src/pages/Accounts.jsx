import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import {
  Button,
  Flex,
  Form,
  Input,
  Modal,
  Table,
  Typography,
  message,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { IoAddOutline } from 'react-icons/io5';
import {
  createAccount,
  deleteAccount,
  getAccounts,
  updateAccount,
} from '../apis';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingAccount, setEditingAccount] = useState(null);

  const { Title } = Typography;

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await getAccounts();
      if (response?.success) {
        setAccounts(response?.data);
      } else {
        message.error(response?.message || 'Failed to fetch accounts');
      }
    } catch (error) {
      message.error(error?.message || 'Failed to fetch accounts');
    }
  };

  const handleAddEdit = async (values) => {
    try {
      if (editingAccount) {
        const response = await updateAccount(editingAccount._id, values);
        if (response?.success) {
          message.success('Account updated successfully');
        } else {
          message.error(response?.message);
        }
      } else {
        const response = await createAccount(values);
        if (response?.success) {
          message.success('Account created successfully');
        } else {
          message.error(response?.message);
        }
      }
      setModalVisible(false);
      await fetchAccounts();
    } catch (error) {
      message.error(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteAccount(id);
      if (response?.success) {
        message.success('Account deleted successfully');
        fetchAccounts();
      } else {
        throw new Error(response?.message);
      }
    } catch (error) {
      message.error(error.message || 'Failed to delete account');
    }
  };

  const openModal = (account = null) => {
    setEditingAccount(account);
    form.setFieldsValue(account || { name: '', type: '', balance: 0 });
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 250,
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      width: 200,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
            shape="circle"
            size="small"
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
            shape="circle"
            size="small"
            danger
          />
        </div>
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
            Accounts
          </Title>
          <Button
            icon={<IoAddOutline />}
            type="dashed"
            shape="circle"
            onClick={() => openModal()}
          />
        </Flex>

        <Table dataSource={accounts} columns={columns} rowKey="_id" />
      </Flex>

      <Modal
        title={editingAccount ? 'Edit Account' : 'Add Account'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAddEdit}>
          <Form.Item
            name="name"
            label="Account Name"
            rules={[{ required: true, message: 'Please enter account name' }]}
          >
            <Input placeholder="Enter account name" />
          </Form.Item>

          <Form.Item
            name="balance"
            label="Balance"
            rules={[{ required: true, message: 'Please enter balance' }]}
          >
            <Input type="number" placeholder="Enter initial balance" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Accounts;
