import {
  AutoComplete,
  Button,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { IoAddOutline } from 'react-icons/io5';
import { EditOutlined, DeleteOutlined, FilterOutlined } from '@ant-design/icons';
import {
  createOtherAccount,
  deleteOtherAccount,
  getOtherAccountCategories,
  getOtherAccounts,
  updateOtherAccount,
} from '../apis';
import { Card } from '../components/common';
import { formatBalance } from '../utils';

const DEFAULT_PAGINATION = { page: 1, pageSize: 20, total: 0 };

const OtherAccounts = () => {
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({ search: '', category: undefined });
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const { Title } = Typography;

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ value: category })),
    [categories]
  );

  const fetchCategories = async () => {
    try {
      const response = await getOtherAccountCategories();
      if (response?.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      message.error(error?.message || 'Failed to fetch categories');
    }
  };

  const fetchAccounts = async (params = {}) => {
    try {
      setLoading(true);
      const query = {
        page: pagination.page,
        limit: pagination.pageSize,
        ...filters,
        ...params,
      };

      const response = await getOtherAccounts(query);
      if (response?.success) {
        setAccounts(response.data || []);
        if (response.pagination) {
          setPagination((prev) => ({ ...prev, ...response.pagination }));
        }
      } else {
        message.error(response?.message || 'Failed to fetch other accounts');
      }
    } catch (error) {
      message.error(error?.message || 'Failed to fetch other accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts({ page: 1 });
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openModal = (account = null) => {
    setEditingAccount(account);
    form.setFieldsValue(
      account || {
        name: '',
        category: '',
        openingBalance: 0,
      }
    );
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingAccount(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitLoading(true);
      if (editingAccount) {
        const response = await updateOtherAccount(editingAccount._id, {
          name: values.name,
          category: values.category,
        });
        if (!response?.success) {
          throw new Error(response?.message || 'Unable to update account');
        }
        message.success('Other account updated successfully');
      } else {
        const response = await createOtherAccount({
          name: values.name,
          category: values.category,
          openingBalance: values.openingBalance,
        });
        if (!response?.success) {
          throw new Error(response?.message || 'Unable to create account');
        }
        message.success('Other account created successfully');
      }
      closeModal();
      fetchAccounts();
      fetchCategories();
    } catch (error) {
      message.error(error?.message || 'Operation failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (accountId) => {
    try {
      const response = await deleteOtherAccount(accountId);
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to delete account');
      }
      message.success('Other account deleted successfully');
      fetchAccounts();
      fetchCategories();
    } catch (error) {
      message.error(error?.message || 'Failed to delete account');
    }
  };

  const handleTableChange = (paginationConfig) => {
    const { current, pageSize } = paginationConfig;
    setPagination((prev) => ({ ...prev, page: current, pageSize }));
    fetchAccounts({ page: current, limit: pageSize });
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value || undefined }));
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchAccounts({ page: 1 });
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'otherAccountId',
      key: 'otherAccountId',
      width: 100,
      render: (value) => (value ? `#${value}` : '—'),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 220,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 200,
      render: (category) => (category ? <Tag color="green">{category}</Tag> : '—'),
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      width: 180,
      render: (balance) => formatBalance(balance),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit account">
            <Button
              icon={<EditOutlined />}
              shape="circle"
              size="small"
              onClick={() => openModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete account">
            <Button
              icon={<DeleteOutlined />}
              shape="circle"
              size="small"
              danger
              onClick={() => handleDelete(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ width: '70%' }}>
      <Flex vertical style={{ width: '100%', gap: 16 }}>
        <Flex
          justify="space-between"
          align="center"
          style={{ marginBottom: 16 }}
        >
          <Title level={3} style={{ margin: 0 }}>
            Other Accounts
          </Title>
          <Button
            icon={<IoAddOutline />}
            type="dashed"
            shape="circle"
            onClick={() => openModal()}
          />
        </Flex>

        <Card
          title={
            <Space size="small">
              <FilterOutlined />
              <span>Filters</span>
            </Space>
          }
          style={{ width: '100%' }}
        >
          <Flex gap={16} wrap="wrap">
            <Input.Search
              placeholder="Search by account name"
              allowClear
              value={filters.search}
              style={{ maxWidth: 280 }}
              onChange={(event) =>
                handleFilterChange('search', event.target.value)
              }
              onSearch={(value) => handleFilterChange('search', value)}
            />
            <AutoComplete
              placeholder="Filter by category"
              value={filters.category}
              options={categoryOptions}
              allowClear
              style={{ maxWidth: 240 }}
              onChange={(value) => handleFilterChange('category', value)}
            />
          </Flex>
        </Card>

        <Card style={{ width: '100%' }}>
          <Table
            columns={columns}
            dataSource={accounts}
            rowKey="_id"
            loading={loading}
            pagination={{
              current: pagination.page,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
            }}
            onChange={handleTableChange}
          />
        </Card>

        <Modal
          title={editingAccount ? 'Edit Other Account' : 'Add Other Account'}
          open={modalVisible}
          onCancel={closeModal}
          onOk={() => form.submit()}
          confirmLoading={submitLoading}
          destroyOnClose
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="name"
              label="Account Name"
              rules={[{ required: true, message: 'Please enter account name' }]}
            >
              <Input placeholder="Enter account name" />
            </Form.Item>

            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please enter category' }]}
            >
              <AutoComplete
                options={categoryOptions}
                placeholder="Enter or select category"
                filterOption={(inputValue, option) =>
                  option?.value
                    ?.toLowerCase()
                    .includes(inputValue.toLowerCase())
                }
              />
            </Form.Item>

            {!editingAccount && (
              <Form.Item
                name="openingBalance"
                label="Opening Balance"
                rules={[{ required: true, message: 'Please enter opening balance' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter opening balance"
                  controls={false}
                  formatter={(value) => `${value}`}
                  parser={(value) => Number(value || 0)}
                />
              </Form.Item>
            )}
          </Form>
        </Modal>
      </Flex>
    </div>
  );
};

export default OtherAccounts;
