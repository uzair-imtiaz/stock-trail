import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Input, message, Popconfirm, Table } from 'antd';
import Title from 'antd/es/typography/Title';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteInventory, getInventory } from '../apis';

const { Search } = Input;

const InventoryList = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    setFilteredInventory(inventory);
  }, [inventory]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await getInventory();
      if (response.success) {
        setInventory(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error(error.message || 'Failed to fetch inventory');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteInventory(id);
      if (response.success) {
        message.success(response.message);
        fetchInventory();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error(error.message || 'Failed to delete inventory item');
    }
  };

  const handleSearch = (value) => {
    const searchValue = value.toLowerCase();
    const filtered = inventory.filter(
      (item) =>
        item.product.toLowerCase().includes(searchValue) ||
        item.flavor.toLowerCase().includes(searchValue)
    );
    setFilteredInventory(filtered);
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      className: 'font-weight-bold',
    },
    {
      title: 'Flavor',
      dataIndex: 'flavor',
      key: 'flavor',
      sorter: (a, b) => a.flavor.localeCompare(b.flavor),
    },
    {
      title: 'Grammage',
      dataIndex: 'grammage',
      key: 'grammage',
      render: (text) => `${text}g`,
      sorter: (a, b) => a.grammage - b.grammage,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: 'Opening Date',
      dataIndex: 'openingDate',
      key: 'openingDate',
      render: (_, record) => dayjs(record.openingDate).format('DD-MM-YYYY'),
      sorter: (a, b) =>
        dayjs(a.openingDate).unix() - dayjs(b.openingDate).unix(),
    },
    {
      title: 'Stock Value',
      key: 'stockValue',
      render: (_, record) => `PKR ${record.unitPrice * record.quantity}`,
      sorter: (a, b) => a.unitPrice * a.quantity - b.unitPrice * b.quantity,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <>
          <Button
            onClick={() =>
              navigate(`/inventory/${record._id}/edit`, {
                state: { item: record },
              })
            }
            icon={<EditOutlined />}
            size="small"
            type="link"
          />
          <Popconfirm
            title="Are you sure to delete this item?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} size="small" type="link" />
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <>
      <Flex align="center" justify="space-between">
        <Title level={3}>Inventory Management</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/inventory/new')}
          className="mb-3"
        >
          Add Inventory
        </Button>
      </Flex>
      <Search
        placeholder="Search by Product or Flavor"
        onSearch={handleSearch}
        style={{ marginBottom: 16, width: '30%' }}
        allowClear
      />
      <Table
        columns={columns}
        dataSource={filteredInventory}
        loading={loading}
        rowKey="_id"
        bordered
        scroll={{ x: true }}
        pagination={{
          position: ['bottomRight'],
          showSizeChanger: true,
          defaultPageSize: 10,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
      />
    </>
  );
};

export default InventoryList;
