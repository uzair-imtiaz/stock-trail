import { Button, DatePicker, message, Select, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { BsPrinter, BsSearch } from 'react-icons/bs';
import { getRoutes, getSalesReport, getUsersByRole } from '../../apis';
import { objectToQueryString } from '../../utils';
import { PrintTable } from '../common';

const { RangePicker } = DatePicker;
const processDataForRowSpan = (rawData) => {
  let processedData = [];
  let dropIdCounter = {};

  rawData.forEach((dropRecord) => {
    const dropId = dropRecord._id;
    dropIdCounter[dropId] = dropRecord.inventoryDropped.length;

    dropRecord.inventoryDropped.forEach((item, index) => {
      processedData.push({
        ...item,
        key: `${dropId}-${item._id}`,
        dropId: dropId,
        date: dropRecord.date,
        driverName: dropRecord.driverName,
        licenseNumber: dropRecord.licenseNumber,
        totalAmount: dropRecord.totalAmount,
        profit: dropRecord.profit,
        isFirstRow: index === 0,
      });
    });
  });

  return processedData;
};

const SalesReport = () => {
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

  useEffect(() => {
    fetchLists();
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const queryString = objectToQueryString({
        startDate: dateRange[0],
        endDate: dateRange[1],
        routeId: route,
        salesman: salesman,
      });
      const response = await getSalesReport(queryString);

      if (response?.success) {
        const processedData = processDataForRowSpan(response?.data);
        setData(processedData);
      } else {
        message.error(response?.message);
      }
    } catch (error) {
      console.error(error);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Drop ID',
      dataIndex: 'dropId',
      key: 'dropId',
      render: (text, record) => {
        // Only render for the first row of each drop
        if (record.isFirstRow) {
          const rowCount = data.filter((item) => item.dropId === text).length;
          return {
            children: <strong>{text}</strong>,
            props: {
              rowSpan: rowCount,
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
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text, record) => {
        const formattedDate = dayjs(text).format('YYYY-MM-DD');
        // Only render for the first row of each drop
        if (record.isFirstRow) {
          const rowCount = data.filter(
            (item) => item.dropId === record.dropId
          ).length;
          return {
            children: formattedDate,
            props: {
              rowSpan: rowCount,
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
      title: 'Driver',
      dataIndex: 'driverName',
      key: 'driverName',
      render: (text, record) => {
        // Only render for the first row of each drop
        if (record.isFirstRow) {
          const rowCount = data.filter(
            (item) => item.dropId === record.dropId
          ).length;
          return {
            children: text,
            props: {
              rowSpan: rowCount,
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
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
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
      title: 'Dropped Qty',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'TPR (Free Pieces)',
      dataIndex: 'tpr',
      key: 'tpr',
    },
    {
      title: 'Wastage',
      dataIndex: 'wastage',
      key: 'wastage',
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (text, record) => {
        // Only render for the first row of each drop
        if (record.isFirstRow) {
          const rowCount = data.filter(
            (item) => item.dropId === record.dropId
          ).length;
          return {
            children: text,
            props: {
              rowSpan: rowCount,
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
  ];

  return (
    <div className="p-4">
      <Title level={3}>Sales Report</Title>
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

      {data && (
        <PrintTable
          columns={columns}
          data={data}
          loading={loading}
        />
      )}
    </div>
  );
};

export default SalesReport;
