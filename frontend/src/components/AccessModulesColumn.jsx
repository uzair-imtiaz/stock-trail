import { useState } from 'react';
import { TreeSelect, Button, message } from 'antd';

const AccessModulesColumn = ({
  userId,
  initialModules,
  fetchUsers,
  updateUserAccess,
}) => {
  const [selectedModules, setSelectedModules] = useState(initialModules || []);
  const [loading, setLoading] = useState(false);

  const moduleOptions = [
    {
      title: 'Dashboard',
      value: 'dashboard',
    },
    {
      title: 'Inventory',
      value: 'inventory',
      children: [
        { title: 'Create Inventory', value: 'inventory.create' },
        { title: 'Edit Inventory', value: 'inventory.edit' },
        { title: 'Delete Inventory', value: 'inventory.delete' },
      ],
    },
    {
      title: 'Routes',
      value: 'routes',
      children: [
        { title: 'Create Route', value: 'routes.create' },
        { title: 'Edit Route', value: 'routes.edit' },
        { title: 'Delete Route', value: 'routes.delete' },
      ],
    },
    {
      title: 'Users',
      value: 'users',
      children: [
        { title: 'Create User', value: 'users.create' },
        { title: 'Edit User', value: 'users.edit' },
        { title: 'Delete User', value: 'users.delete' },
      ],
    },
  ];

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await updateUserAccess(userId, {
        modules: selectedModules,
      });
      if (response.success) {
        message.success(response.message);
        fetchUsers();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error(error?.message || 'Failed to update access');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TreeSelect
      treeData={moduleOptions}
      value={selectedModules}
      onChange={setSelectedModules}
      treeCheckable
      showCheckedStrategy={TreeSelect.SHOW_PARENT}
      placeholder="Select Modules"
      dropdownRender={(menu) => (
        <div>
          {menu}
          <div style={{ textAlign: 'right', padding: 8 }}>
            <Button type="primary" onClick={handleSave} loading={loading}>
              Save
            </Button>
          </div>
        </div>
      )}
      style={{ width: '100%', overflowY: 'auto', overflowX: 'hidden' }}
    />
  );
};

export default AccessModulesColumn;
