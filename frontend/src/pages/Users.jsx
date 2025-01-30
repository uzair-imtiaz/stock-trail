import { useEffect, useState } from 'react';
import { Table, message } from 'antd';
import { getUsers, updateUserAccess } from '../apis';
import AccessModulesColumn from '../components/AccessModulesColumn';

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
      <h2>User Access Management</h2>
      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="_id"
      />
    </div>
  );
};

export default Users;
