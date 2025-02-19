import { useEffect, useState } from 'react';
import { Table, message } from 'antd';
import { getUsers, updateUserAccess } from '../apis';
import AccessModulesColumn from '../components/AccessModulesColumn';
import Title from 'antd/es/typography/Title';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers();
      if (response?.success) {
        setUsers(response?.data);
      } else {
        message.error(response?.message || 'Failed to fetch users');
      }
    } catch (error) {
      message.error(error?.message || 'Failed to fetch users');
    }
    setLoading(false);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span style={{ width: '100%' }}>{text}</span>,
      width: '200px',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (text) => <span style={{ width: '100%' }}>{text}</span>,
      width: '150px',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => <span style={{ width: '100%' }}>{text}</span>,
      width: '250px',
    },
    {
      title: 'Access Modules',
      dataIndex: 'modules',
      key: 'modules',
      render: (modules, record) => (
        <AccessModulesColumn
          userId={record._id}
          initialModules={modules}
          fetchUsers={fetchUsers}
          updateUserAccess={updateUserAccess}
        />
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>User Access Management</Title>
      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="_id"
        bordered
        scroll={{ x: true }}
      />
    </div>
  );
};

export default Users;
