import { useEffect, useState } from 'react';
import { Table, InputNumber, Select, Button, Switch, message } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { getGroupedInventory, getRoutes, getUsersByRole } from '../apis';

const { Option } = Select;

const processRowSpan = (data) => {
  const categoryCount = {};

  data.forEach((item) => {
    categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
  });

  let categoryRowTracker = {};
  return data.map((item) => {
    if (!categoryRowTracker[item.category]) {
      categoryRowTracker[item.category] = true;
      return { ...item, categoryRowSpan: categoryCount[item.category] };
    }
    return { ...item, categoryRowSpan: 0 };
  });
};

const SalesScreen = () => {
  const [inventory, setInventory] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [routesRes, inventoryRes, salesManRes] = await Promise.all([
        getRoutes(),
        getGroupedInventory(),
        getUsersByRole('salesman'),
      ]);
      if (inventoryRes.success && routesRes.success) {
        const processedData = processRowSpan(inventoryRes.data);
        setInventory(processedData);
        setRoutes(routesRes.data);
        setSalesmen(salesManRes.data);
      }
    } catch (error) {
      message.error(error.message || 'Failed to fetch data');
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
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
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
        <InputNumber
          min={0}
          max={record.quantity}
          placeholder="Enter Qty"
          defaultValue={0}
        />
      ),
    },
    {
      title: 'TPR (Free Pieces)',
      dataIndex: 'tpr',
      key: 'tpr',
      render: () => (
        <InputNumber min={0} placeholder="Enter TPR" defaultValue={0} />
      ),
    },
    {
      title: 'Expenses',
      dataIndex: 'expenses',
      key: 'expenses',
      render: () => (
        <InputNumber min={0} placeholder="Enter Expenses" defaultValue={0} />
      ),
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
          {routes.map((route) => (
            <Option value={route._id}>{route.name}</Option>
          ))}
        </Select>
        <Select placeholder="Select Salesman" style={{ width: 200 }}>
          {salesmen.map((salesman) => (
            <Option value={salesman._id}>{salesman.name}</Option>
          ))}
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
        bordered
      />
      <Button type="primary" style={{ marginTop: '20px' }}>
        Submit Sales
      </Button>
    </div>
  );
};

export default SalesScreen;

// only one field for expenses
