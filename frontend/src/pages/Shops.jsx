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
import { useEffect, useState } from 'react';
import { IoAddOutline } from 'react-icons/io5';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { getShops, updateShop, createShop, deleteShop } from '../apis';

const Shops = () => {
  const [shops, setShops] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentShop, setCurrentShop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmittingLoading] = useState(false);

  const [form] = Form.useForm();

  const { Title } = Typography;

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const response = await getShops();
      if (response?.success) {
        setShops(response?.data);
      } else {
        message.error(response?.message || 'Failed to fetch shops');
      }
    } catch (error) {
      message.error(error?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const showAddModal = () => {
    setIsEditing(false);
    setCurrentShop(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const showEditModal = (shop) => {
    setIsEditing(true);
    setCurrentShop(shop);
    form.setFieldsValue({ name: shop.name, shopId: shop.shopId });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      setSubmittingLoading(true);
      if (isEditing) {
        const response = await updateShop(currentShop._id, values);
        if (response?.success) {
          message.success('Shop updated successfully');
          await fetchShops();
        } else {
          message.error(response?.message || 'Failed to update shop');
        }
      } else {
        const response = await createShop(values);
        if (response?.success) {
          message.success('Shop added successfully');
          await fetchShops();
        } else {
          message.error(response?.message || 'Failed to add shop');
        }
      }
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error(error?.message || 'An error occurred');
    } finally {
      setSubmittingLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await deleteShop(id);
      if (response?.success) {
        message.success(response?.message);
        fetchShops();
      } else {
        message.error(response?.message || 'Failed to delete shop');
      }
    } catch (error) {
      message.error(error?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'shopId',
      key: 'shopId',
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
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
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
            Shops
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
          dataSource={shops}
          bordered
          style={{ width: '100%' }}
          rowKey="_id"
          loading={loading}
        />
      </Flex>

      <Modal
        title={isEditing ? 'Update Shop' : 'Add New Shop'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        loading={submitLoading}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="shopId"
            label="Shop ID"
            rules={[
              { required: true, message: 'Please enter the shop ID' },
              { min: 2, message: 'Shop ID must be at least 2 characters' },
            ]}
          >
            <Input placeholder="Shop ID" />
          </Form.Item>
          <Form.Item
            name="name"
            label="Shop Name"
            rules={[
              { required: true, message: 'Please enter the shop name' },
              { min: 2, message: 'Name must be at least 2 characters' },
            ]}
          >
            <Input placeholder="Enter shop name" />
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

export default Shops;
