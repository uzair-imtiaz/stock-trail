import React, { useState, useEffect } from 'react';
import { Table, Button, message } from 'antd';
import { getInvoices } from '../apis';

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
      // render: (text) => <span style={{ width: "100%" }}>{text}</span>,
      // width: "250px",
    },
    {
      title: 'Route Name',
      dataIndex: 'routeName',
      key: 'routeName',
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
    },
    {
      title: 'Total Expenses',
      dataIndex: 'expenses',
      key: 'expenses',
      render: (expenses) =>
        expenses.reduce((total, expense) => total + expense.amount, 0),
    },
    {
      title: 'Net Amount',
      dataIndex: 'profit',
      key: 'profit',
    },
  ];

  return (
    <Table dataSource={invoices} columns={columns} bordered loading={loading} />
  );
};

export default Invoices;
