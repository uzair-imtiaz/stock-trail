import React, { useState, useEffect } from 'react';
import { Table, Button, message } from 'antd';
import { getInvoices } from '../apis';
import Title from 'antd/es/typography/Title';
import { formatBalance } from '../utils';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const response = await getInvoices();
        if (response?.success) {
          setInvoices(response?.data);
        } else {
          message.error(response?.message || 'Failed to fetch invoices');
        }
      } catch (error) {
        message.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const columns = [
    {
      title: 'Sales ID',
      dataIndex: '_id',
      key: '_id',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Route Name',
      dataIndex: ['routeId', 'name'],
      key: 'routeName',
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => formatBalance(amount),
    },
    {
      title: 'Total Expenses',
      dataIndex: 'expenses',
      key: 'expenses',
      render: (expenses) =>
        formatBalance(
          expenses.reduce((total, expense) => total + expense.amount, 0)
        ),
    },
    {
      title: 'Net Amount',
      dataIndex: 'profit',
      key: 'profit',
      render: (amount) => formatBalance(amount),
    },
  ];

  return (
    <>
      <Title level={3}>Invoices</Title>
      <Table
        dataSource={invoices}
        columns={columns}
        bordered
        loading={loading}
      />
    </>
  );
};

export default Invoices;
