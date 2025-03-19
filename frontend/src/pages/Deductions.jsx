import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import {
  Button,
  Flex,
  Form,
  Input,
  Modal,
  Select,
  Table,
  Typography,
  message,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { IoAddOutline } from 'react-icons/io5';
import {
  createDeduction,
  deleteDeduction,
  getDeductions,
  updateDeduction,
} from '../apis';
import { DEDUCTIONS } from '../constants';

const Deductions = () => {
  const [deductions, setDeductions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingDeduction, setEditingDeduction] = useState(null);

  const { Title } = Typography;

  useEffect(() => {
    fetchDeductions();
  }, []);

  const fetchDeductions = async () => {
    try {
      const response = await getDeductions();
      if (response?.success) {
        setDeductions(response?.data);
      } else {
        message.error(response?.message || 'Failed to fetch deductions');
      }
    } catch (error) {
      message.error(error?.message || 'Failed to fetch deductions');
    }
  };

  const handleAddEdit = async (values) => {
    try {
      if (editingDeduction) {
        const response = await updateDeduction(editingDeduction._id, values);
        if (response?.success) {
          message.success('Deduction updated successfully');
        } else {
          message.error(response?.message);
        }
      } else {
        const response = await createDeduction(values);
        if (response?.success) {
          message.success('Deduction created successfully');
        } else {
          message.error(response?.message);
        }
      }
      setModalVisible(false);
      await fetchDeductions();
    } catch (error) {
      message.error(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteDeduction(id);
      if (response?.success) {
        message.success('Deduction deleted successfully');
        fetchDeductions();
      } else {
        throw new Error(response?.message);
      }
    } catch (error) {
      message.error(error.message || 'Failed to delete deduction');
    }
  };

  const openModal = (deduction = null) => {
    setEditingDeduction(deduction);
    form.setFieldsValue(deduction || { name: '', type: null, balance: 0 });
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
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 200,
    },
    {
      title: 'Amount%',
      dataIndex: 'amount',
      key: 'amount',
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
            Deductions
          </Title>
          <Button
            icon={<IoAddOutline />}
            type="dashed"
            shape="circle"
            onClick={() => openModal()}
          />
        </Flex>

        <Table dataSource={deductions} columns={columns} rowKey="_id" />
      </Flex>

      <Modal
        title={editingDeduction ? 'Edit Deduction' : 'Add Deduction'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAddEdit}>
          <Form.Item
            name="name"
            label="Deduction Name"
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input placeholder="Enter deduction name" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please select type' }]}
          >
            <Select
              options={DEDUCTIONS}
              placeholder="Select type"
              allowClear
              optionFilterProp="label"
              defaultValue={null}
            />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: 'Please enter amount' }]}
          >
            <Input type="number" placeholder="Enter amount %" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Deductions;
