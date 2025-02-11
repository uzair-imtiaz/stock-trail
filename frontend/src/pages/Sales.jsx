import { useEffect, useState } from 'react';
import { Table, InputNumber, Select, Button, Switch } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { getGroupedInventory, getRoutes } from '../apis';

const { Option } = Select;

const processRowSpan = (data) => {
  const categoryCount = {}; // Track count of each category

  // Count occurrences of each category
  data.forEach((item) => {
    categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
  });

  // Assign rowSpan values
  let categoryRowTracker = {};
  return data.map((item) => {
    if (!categoryRowTracker[item.category]) {
      categoryRowTracker[item.category] = true; // Mark first occurrence
      return { ...item, categoryRowSpan: categoryCount[item.category] };
    }
    return { ...item, categoryRowSpan: 0 };
  });
};

const SalesScreen = () => {
  const [inventory, setInventory] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getGroupedInventory();
      if (response.success) {
        const processedData = processRowSpan(response.data);
        setInventory(processedData);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const columns = [
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text, record) => {
        if (record.categoryRowSpan > 0) {
          return {
            children: <strong>{text}</strong>,
            props: {
              rowSpan: record.categoryRowSpan,
            },
          };
        }
        return {
          props: {
            rowSpan: 0,
          },
        };
      },
    },
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: 'Grammage',
      dataIndex: 'grammage',
      key: 'grammage',
      render: (text) => `${text} g`,
    },
    {
      title: 'Available Qty',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Dispatch Qty',
      dataIndex: 'dispatchQty',
      key: 'dispatchQty',
      render: (_, record) => (
        <InputNumber min={0} max={record.quantity} placeholder="Enter Qty" />
      ),
    },
    {
      title: 'TPR (Free Pieces)',
      dataIndex: 'tpr',
      key: 'tpr',
      render: () => <InputNumber min={0} placeholder="Enter TPR" />,
    },
    {
      title: 'Transfer to Wastage',
      dataIndex: 'wastage',
      key: 'wastage',
      render: () => (
        <Switch
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
        />
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <Select placeholder="Select Route" style={{ width: 200 }}>
          <Option value="route1">Route 1</Option>
          <Option value="route2">Route 2</Option>
        </Select>
        <Select placeholder="Select Salesman" style={{ width: 200 }}>
          <Option value="salesman1">Salesman 1</Option>
          <Option value="salesman2">Salesman 2</Option>
        </Select>
        <InputNumber placeholder="Driver Name" style={{ width: 200 }} />
        <InputNumber placeholder="License Plate #" style={{ width: 200 }} />
      </div>

      <Table
        columns={columns}
        dataSource={inventory}
        rowKey="_id"
        loading={loading}
        pagination={false}
      />
      <Button type="primary" style={{ marginTop: '20px' }}>
        Submit Sales
      </Button>
    </div>
  );
};

export default SalesScreen;
