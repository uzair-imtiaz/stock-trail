import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Form, Input, Modal, Select, Table, message } from 'antd';
import Title from 'antd/es/typography/Title';
import { useCallback, useEffect, useState } from 'react';
import {
  createRoute,
  deleteRoute,
  getRoutes,
  getShops,
  updateRoute,
} from '../apis';

import ShopCell from '../components/ShopColumn';

const RoutesPage = () => {
  const [routes, setRoutes] = useState([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [shops, setShops] = useState([]);
  const [form] = Form.useForm();

  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getRoutes();
      if (response?.success) {
        setRoutes(response?.data);
      } else {
        message.error(response?.message);
      }
    } catch (error) {
      message.error(error?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchShops = async () => {
    try {
      const response = await getShops();
      if (response?.success) {
        setShops(response?.data);
      } else {
        message.error(response?.message || 'Failed to fetch shops');
      }
    } catch (error) {
      message.error(error?.message || 'Failed to fetch shops');
    }
  };

  useEffect(() => {
    fetchRoutes();
    fetchShops();
  }, [fetchRoutes]);

  const handleDelete = async (id) => {
    try {
      setSaveLoading(true);
      const response = await deleteRoute(id);
      if (response?.success) {
        message.success(response?.message);
        fetchRoutes();
      } else {
        message.error(response?.message);
      }
    } catch (error) {
      message.error(error?.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAddOrUpdate = async (values) => {
    try {
      setLoading(true);
      const response = await (selectedRoute
        ? updateRoute(selectedRoute?._id, values)
        : createRoute(values));
      if (response?.success) {
        message.success(response?.message);
        fetchRoutes();
        setIsModalOpen(false);
      } else {
        message.error(response?.message);
      }
    } catch (err) {
      message.error(err?.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (route = null) => {
    setSelectedRoute(route);
    setIsModalOpen(true);
    if (route) {
      form.setFieldsValue({
        ...route,
        shops: route.shops?.map((shop) => shop._id) || [], // Extract shop IDs
      });
    } else {
      form.resetFields();
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '25%',
    },
    {
      title: 'Shops',
      dataIndex: ['shops'],
      key: 'shops',
      width: '55%',
      render: (shops) => <ShopCell shops={shops} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '20%',
      render: (text, record) => (
        <>
          <Button
            icon={<EditOutlined />}
            type="link"
            onClick={() => openModal(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            type="link"
            danger
            onClick={() => handleDelete(record._id)}
          />
        </>
      ),
    },
  ];

  return (
    <div>
      <Flex direction="row" justify="space-between">
        <Title level={3}>Route Management</Title>
        <Button
          type="primary"
          className="mb-3"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          Add Route
        </Button>
      </Flex>
      <Table
        dataSource={routes}
        columns={columns}
        loading={loading}
        rowKey="id"
        bordered
      />
      <Modal
        title={selectedRoute ? 'Edit Route' : 'Add Route'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        confirmLoading={saveLoading}
      >
        <Form form={form} onFinish={handleAddOrUpdate} layout="vertical">
          <Form.Item
            name="name"
            label="Route Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="shops" label="Shops" rules={[{ required: true }]}>
            <Select
              mode="multiple"
              placeholder="Enter shop names"
              showSearch
              allowClear
              options={shops.map((shop) => ({
                label: shop.name,
                value: shop._id,
              }))}
              filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={saveLoading}>
            Save
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default RoutesPage;
