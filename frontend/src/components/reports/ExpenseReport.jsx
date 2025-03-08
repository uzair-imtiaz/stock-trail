import {
  Button,
  DatePicker,
  message,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { BsSearch } from 'react-icons/bs';
import { getExpensesReport, getRoutes, getUsersByRole } from '../../apis';
import { formatBalance } from '../../utils';

const { RangePicker } = DatePicker;

const ExpenseReport = () => {
  const { Title } = Typography;

  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  const [dateRange, setDateRange] = useState([]);
  const [route, setRoute] = useState(null);
  const [salesman, setSalesman] = useState(null);
  const [data, setData] = useState(null);

  const fetchLists = async () => {
    setLoading(true);
    try {
      const [routesRes, salesmenRes] = await Promise.all([
        getRoutes(),
        getUsersByRole('salesman'),
      ]);
      if (routesRes.success && salesmenRes.success) {
        setRoutes(
          routesRes.data.map((route) => ({
            label: route.name,
            value: route._id,
          }))
        );
        setSalesmen(
          salesmenRes.data.map((salesman) => ({
            label: salesman.name,
            value: salesman._id,
          }))
        );
      } else {
        message.error('Something went wrong');
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await getExpensesReport({
        startDate: dateRange[0],
        endDate: dateRange[1],
        routeId: route,
        salesman: salesman,
      });
      if (!response.success) {
        message.error(response?.message || 'Something went wrong');
        return;
      }
      setData(
        response.data.map((expense) => ({
          key: expense._id,
          date: dayjs(expense.date).format('YYYY-MM-DD'),
          name: expense.name,
          amount: expense.amount,
        }))
      );
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const columns = [
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Expense Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => formatBalance(amount),
    },
  ];

  return (
    <div className="p-4">
      <Title level={3}>Expense Report</Title>
      <Space className="w-full my-3 flex flex-wrap md:flex-nowrap justify-between gap-2">
        <div className="flex flex-wrap md:flex-nowrap gap-2 flex-grow">
          <RangePicker
            onChange={(dates) => setDateRange(dates)}
            disabledDate={(current) =>
              current && current > dayjs().endOf('day')
            }
          />
          <Select
            placeholder="Select Route"
            style={{ width: 150 }}
            onChange={(value) => setRoute(value)}
            options={routes}
            showSearch
            allowClear
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
          />
          <Select
            placeholder="Select Salesman"
            style={{ width: 150 }}
            onChange={(value) => setSalesman(value)}
            options={salesmen}
            allowClear
            showSearch
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
          />
        </div>

        <Button
          type="primary"
          icon={<BsSearch />}
          loading={loading}
          onClick={handleSearch}
        >
          Search
        </Button>
      </Space>

      {data && (
        <Table columns={columns} dataSource={data} bordered loading={loading} />
      )}
    </div>
  );
};

export default ExpenseReport;
