import { useEffect, useState } from 'react';
import { Table, InputNumber, Select, Button, message, Input } from 'antd';
import {
  createSale,
  getGroupedInventory,
  getRoutes,
  getUsersByRole,
} from '../apis';
import ExpensesSection from '../components/Expenses';
import Title from 'antd/es/typography/Title';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const processRowSpan = (list) => {
  const data = list.filter((item) => item?.location !== 'Wastage');
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
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [salesmen, setSalesmen] = useState([]);
  const [selectedSalesman, setSelectedSalesman] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [driverName, setDriverName] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      let total = 0;
      inventory.forEach((item) => {
        total += (item.dispatchQty || 0) * (item.unitPrice || 0);
      });

      expenses.forEach((expense) => {
        total -= expense.amount || 0;
      });

      setTotalAmount(total);
    }, 500);

    return () => clearTimeout(timer);
  }, [inventory, expenses]);

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

  const handleValueChange = (value, record, field) => {
    const updatedInventory = inventory.map((item) =>
      item._id === record._id ? { ...item, [field]: value || 0 } : item
    );
    setInventory(updatedInventory);
  };

  const handleExpenseChange = (index, field, value) => {
    const updatedExpenses = expenses.map((expense, i) =>
      i === index ? { ...expense, [field]: value } : expense
    );
    setExpenses(updatedExpenses);
  };

  const addExpense = () => {
    setExpenses([...expenses, { description: '', amount: 0 }]);
  };

  const removeExpense = (index) => {
    const updatedExpenses = expenses.filter((_, i) => i !== index);
    setExpenses(updatedExpenses);
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
      title: 'Dispatch Qty (Cartons)',
      dataIndex: 'dispatchQty',
      key: 'dispatchQty',
      render: (_, record) => (
        <InputNumber
          min={0}
          max={record.quantity}
          placeholder="Enter Qty"
          defaultValue={0}
          onChange={(value) => handleValueChange(value, record, 'dispatchQty')}
        />
      ),
    },
    {
      title: 'TPR (Free Pieces)',
      dataIndex: 'tpr',
      key: 'tpr',
      render: (_, record) => (
        <InputNumber
          min={0}
          max={record.quantity}
          placeholder="Enter TPR"
          defaultValue={0}
          onChange={(value) => handleValueChange(value, record, 'tpr')}
        />
      ),
    },
    {
      title: 'Transfer to Wastage',
      dataIndex: 'wastage',
      key: 'wastage',
      render: (_, record) => (
        <InputNumber
          min={0}
          max={record.quantity}
          placeholder="Enter Wastage"
          defaultValue={0}
          onChange={(value) => handleValueChange(value, record, 'wastage')}
        />
      ),
    },
  ];

  const handleSubmit = async () => {
    if (!selectedRoute || !selectedSalesman || !driverName || !licensePlate) {
      message.error('Please fill in all required fields.');
      return;
    }

    const inventoryDropped = inventory
      .filter((item) => item.dispatchQty > 0)
      .map((item) => ({
        items: [
          {
            itemId: item._id,
            quantityDropped: item.dispatchQty,
            tpr: item.tpr || 0,
            wastage: item.wastage || 0,
          },
        ],
      }));

    const payload = {
      routeId: selectedRoute,
      date: new Date().toISOString(),
      salesman: selectedSalesman,
      driverName,
      licenseNumber: licensePlate,
      inventoryDropped,
      expenses,
      totalAmount,
      profit: 0,
      creditAmount: 0,
    };

    try {
      setLoading(true);
      const response = await createSale(payload);

      if (response?.success) {
        message.success(response?.message);
        navigate('/invoices');
      } else {
        message.error(response?.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Error submitting sales:', error);
      message.error(error.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-2">
        <Title level={3}>Add a Sale</Title>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <Select
            placeholder="Select Route"
            style={{ width: 200 }}
            onSelect={(value) => setSelectedRoute(value)}
          >
            {routes.map((route) => (
              <Option key={route._id} value={route._id}>
                {route.name}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Select Salesman"
            style={{ width: 200 }}
            onSelect={(value) => setSelectedSalesman(value)}
          >
            {salesmen.map((salesman) => (
              <Option key={salesman._id} value={salesman._id}>
                {salesman.name}
              </Option>
            ))}
          </Select>
          <Input
            placeholder="Driver Name"
            style={{ width: 200 }}
            onChange={(e) => setDriverName(e.target.value)}
          />
          <Input
            placeholder="License Plate #"
            style={{ width: 200 }}
            onChange={(e) => setLicensePlate(e.target.value)}
          />
        </div>

        <Table
          columns={columns}
          dataSource={inventory}
          rowKey="_id"
          loading={loading}
          pagination={false}
          bordered
        />
      </div>

      <ExpensesSection
        expenses={expenses}
        onExpenseChange={handleExpenseChange}
        onAddExpense={addExpense}
        onRemoveExpense={removeExpense}
        totalAmount={totalAmount}
      />

      <Button
        type="primary"
        style={{ float: 'right', marginTop: '20px' }}
        onClick={handleSubmit}
      >
        Submit Sales
      </Button>
    </>
  );
};

export default SalesScreen;
