import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  message,
  Flex,
  Input,
} from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { getInventory, transferStock } from '../apis';

const StockManagement = () => {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [transferForm] = Form.useForm();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await getInventory();
      if (response?.success) {
        setInventory(response.data);
      } else {
        message.error(response?.message);
      }
    } catch (error) {
      message.error(error.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const openTransferModal = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
    transferForm.resetFields();
  };

  const handleTransfer = async (values) => {
    if (!selectedItem) return;

    try {
      const response = await transferStock({
        id: selectedItem._id,
        quantity: values.quantity,
        from: selectedItem.location,
        to: values.location,
      });

      if (response?.success) {
        message.success('Stock transferred successfully');
        fetchInventory();
      } else {
        message.error(response?.message || 'Failed to transfer stock');
      }
    } catch (error) {
      message.error(error.message || 'Error transferring stock');
    }

    setModalVisible(false);
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Grammage',
      dataIndex: 'grammage',
      key: 'grammage',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Button type="link" onClick={() => openTransferModal(record)}>
          <SwapOutlined />
        </Button>
      ),
    },
  ];

  return (
    <Flex vertical gap="large">
      <h1>Stock Management</h1>
      <Table
        columns={columns}
        dataSource={inventory}
        rowKey="_id"
        loading={loading}
        bordered
      />

      <Modal
        title={`Transfer Stock - ${selectedItem?.product}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => transferForm.submit()}
        okText="Transfer"
      >
        <Form form={transferForm} layout="vertical" onFinish={handleTransfer}>
          <Form.Item
            name="location"
            label="Transfer Location"
            rules={[
              { required: true, message: 'Please select transfer location' },
            ]}
            initialValue={
              selectedItem?.location === 'Main' ? 'Wastage' : 'Main'
            }
          >
            <Input
              initialValue={
                selectedItem?.location === 'Main' ? 'Wastage' : 'Main'
              }
              disabled
            />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, message: 'Please enter quantity' }]}
          >
            <InputNumber
              min={1}
              max={selectedItem?.quantity || 1}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  );
};

export default StockManagement;
