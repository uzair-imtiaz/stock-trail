import { Button, message, Table } from 'antd';
import Title from 'antd/es/typography/Title';
import React, { useEffect, useState } from 'react';
import { deleteInvoice, getInvoices } from '../apis';
import { formatBalance } from '../utils';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './invoices.css';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialPage = Number(searchParams.get('page')) || 1;
  const initialPageSize = Number(searchParams.get('limit')) || 20;

  const [pagination, setPagination] = useState({
    current: initialPage,
    pageSize: initialPageSize,
    total: 0,
  });

  useEffect(() => {
    fetchInvoices(pagination.current, pagination.pageSize);
  }, [pagination.current, pagination.pageSize]);

  const fetchInvoices = async (page, pageSize) => {
    try {
      setLoading(true);
      const response = await getInvoices({ page, limit: pageSize });

      if (response?.success) {
        setInvoices(response.data);
        setPagination((prev) => ({
          ...prev,
          current: page,
          pageSize,
          total: response.pagination?.totalPages * pageSize || 0,
        }));

        // Update the URL with new pagination params
        setSearchParams({ page, limit: pageSize });
      } else {
        message.error(response?.message || 'Failed to fetch invoices');
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination) => {
    fetchInvoices(pagination.current, pagination.pageSize);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await deleteInvoice(id);
      if (response?.success) {
        message.success(response?.message);
        fetchInvoices();
      } else {
        message.error(response?.message || 'Failed to delete invoice');
      }
    } catch (error) {
      message.error(error?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

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
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/sales/${record._id}`)}
          />
          <Button
            type="link"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <Title level={3}>Invoices</Title>
      <Table
        dataSource={invoices}
        columns={columns}
        bordered
        rowClassName={(record) =>
          record?.hasReceipt ? 'receipt-present' : 'receipt-absent'
        }
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        rowKey="_id"
      />
    </>
  );
};

export default Invoices;
