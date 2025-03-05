import { PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Table, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { getReceipts } from '../apis';

const Receipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { Title } = Typography;

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        setLoading(true);
        const response = await getReceipts();
        if (response?.success) {
          setReceipts(response?.data);
        } else {
          message.error(response?.message || 'Failed to fetch receipts');
        }
      } catch (error) {
        message.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipts();
  }, []);

  const columns = [
    {
      title: 'Sales ID',
      dataIndex: ['saleId', '_id'],
      key: 'id',
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => dayjs(date).format('DD-MMMM-YYYY'),
    },
    {
      title: 'Net Amount',
      dataIndex: ['saleId', 'profit'],
      key: 'netAmount',
    },
    {
      title: 'Expenses',
      dataIndex: ['saleId', 'expenses'],
      key: 'expenses',
      render: (expenses) =>
        expenses.reduce((total, expense) => total + expense.amount, 0),
    },
    {
      title: 'Credits',
      key: 'credits',
      render: (_, record) =>
        record.credits?.reduce(
          (returnedSum, credit) => returnedSum + credit.creditAmount,
          0
        ) || 0,
    },
    {
      title: 'Returned Credits',
      key: 'returnedCredits',
      render: (_, record) =>
        record.credits?.reduce(
          (returnedSum, credit) => returnedSum + credit.returnedAmount,
          0
        ) || 0,
    },
  ];
  return (
    <>
      <Flex direction="row" justify="space-between" className="mb-4">
        <Title level={3}>Receipts</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/receipts/new')}
          loading={loading}
        >
          Add Receipt
        </Button>
      </Flex>
      <Table
        columns={columns}
        dataSource={receipts}
        bordered
        loading={loading}
      />
    </>
  );
};

export default Receipts;
