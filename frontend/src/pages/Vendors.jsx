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
import { getVendors, updateVendor, createVendor } from '../apis';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentVendor, setCurrentVendor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const { Title } = Typography;

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await getVendors();
      if (response?.success) {
        setVendors(response?.data);
      } else {
        message.error(response?.message || 'Failed to fetch vendors');
      }
    } catch (error) {
      message.error(error?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const showAddModal = () => {
    setIsEditing(false);
    setCurrentVendor(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const showEditModal = (vendor) => {
    setIsEditing(true);
    setCurrentVendor(vendor);
    form.setFieldsValue({ name: vendor.name });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      if (isEditing) {
        const response = await updateVendor(currentVendor._id, values);
        if (response?.success) {
          message.success('Vendor updated successfully');
          await fetchVendors();
        } else {
          message.error(response?.message || 'Failed to update vendor');
        }
      } else {
        const response = await createVendor(values);
        if (response?.success) {
          message.success('Vendor added successfully');
          await fetchVendors();
        } else {
          message.error(response?.message || 'Failed to add vendor');
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
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      width: 200,
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
            Vendors
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
          dataSource={vendors}
          bordered
          style={{ width: '100%' }}
          rowKey="_id"
          loading={loading}
        />
      </Flex>

      <Modal
        title={isEditing ? 'Update Vendor' : 'Add New Vendor'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Vendor Name"
            rules={[
              { required: true, message: 'Please enter the vendor name' },
              { min: 2, message: 'Name must be at least 2 characters' },
            ]}
          >
            <Input placeholder="Enter vendor name" />
          </Form.Item>
          <Form.Item name="balance" label="Balance">
            <Input type="number" placeholder="Enter initial balance" />
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

export default Vendors;
