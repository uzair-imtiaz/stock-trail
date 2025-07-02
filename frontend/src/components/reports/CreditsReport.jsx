import { Button, message, Select, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { BsSearch } from 'react-icons/bs';
import { BsPrinter } from 'react-icons/bs';
import {
  getCreditsReport,
  getRoutes,
  getShops,
  getUsersByRole,
} from '../../apis';
import { PrintTable } from '../common';
import { formatBalance } from '../../utils';

const CreditsReport = () => {
  const { Title } = Typography;

  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  const [shops, setShops] = useState([]);
  const [route, setRoute] = useState(null);
  const [salesman, setSalesman] = useState(null);
  const [shop, setShop] = useState(null);
  const [data, setData] = useState(null);

  const fetchLists = async () => {
    setLoading(true);
    try {
      const [routesRes, salesmenRes, shopsRes] = await Promise.all([
        getRoutes(),
        getUsersByRole('salesman'),
        getShops(),
      ]);
      if (routesRes.success && salesmenRes.success && shopsRes.success) {
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
        setShops(
          shopsRes.data.map((shop) => ({
            label: shop.name,
            value: shop._id,
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
      const response = await getCreditsReport({
        shopId: shop,
        routeId: route,
        salesman: salesman,
      });
      if (!response.success) {
        message.error(response?.message || 'Something went wrong');
        return;
      }
      let runningBalance = 0;

      const formattedData = response.data.map((item) => {
        const credit = item?.totalCredit || 0;
        const returned = item?.totalReturned || 0;
        runningBalance += credit - returned;

        return {
          key: item._id?.shopName,
          date: dayjs(item?._id?.date).format('YYYY-MM-DD'),
          shopName: item._id?.shopName,
          credit: credit,
          returned: returned,
          balance: runningBalance,
        };
      });

      setData(formattedData);
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
    { title: 'Shop', dataIndex: 'shopName', key: 'shopName' },
    {
      title: 'Credit',
      dataIndex: 'credit',
      key: 'credit',
      render: (value) => (value ? formatBalance(value) : '-'),
    },
    {
      title: 'Returned',
      dataIndex: 'returned',
      key: 'returned',
      render: (value) => (value ? formatBalance(value) : '-'),
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (value) => (value ? formatBalance(value) : '-'),
    },
  ];

  return (
    <div className="p-4">
      <Title level={3}>Credits Report</Title>
      <Space className="w-full my-3 flex flex-wrap md:flex-nowrap justify-between gap-2">
        <div className="flex flex-wrap md:flex-nowrap gap-2 flex-grow">
          <Select
            placeholder="Select Shops"
            style={{ width: 150 }}
            onChange={(value) => setShop(value)}
            options={shops}
            showSearch
            allowClear
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
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

        {data && (
          <Button
            type="primary"
            icon={<BsPrinter />}
            onClick={() => window.print()}
          >
            Print
          </Button>
        )}
      </Space>
      {data && <PrintTable columns={columns} data={data} loading={loading} />}
    </div>
  );
};

export default CreditsReport;
