import { useEffect, useState } from 'react';
import { Modal, Table, message, Button } from 'antd';
import { addUser, getUsers, updateUserAccess } from '../apis';
import AccessModulesColumn from '../components/AccessModulesColumn';
import Title from 'antd/es/typography/Title';
import UserForm from '../components/common/forms/user-form/user-form';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
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

  const handleAddUser = async (values) => {
    const response = await addUser(values);
    if (response?.success) {
      message.success('User added successfully!');
      setModalVisible(false);
      fetchUsers();
    } else {
      throw new Error(response?.message || 'Failed to add user');
    }
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
      <Button type="primary" onClick={() => setModalVisible(true)} style={{ marginBottom: 16, float: 'right' }}>
        Add User
      </Button>
      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="_id"
        bordered
        scroll={{ x: true }}
      />
      {modalVisible && (
        <Modal
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          <UserForm title="Add User" onSubmit={handleAddUser} style={{ margin: "30px"}} />
        </Modal>
      )}
    </div>
  );
};

export default Users;
