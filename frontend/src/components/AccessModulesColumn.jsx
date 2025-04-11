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
      title: 'Routes',
      value: 'routes',
    },
    {
      title: 'Inventory',
      value: 'inventory_',
      children: [
        { title: 'Listing', value: 'inventory' },
        { title: 'Stock Management', value: 'inventory/stock-management' },
      ],
    },
    {
      title: 'Sales',
      value: 'sales_',
      children: [
        { title: 'Add Sale', value: 'sales' },
        { title: 'Invoices', value: 'sales/invoices' },
        { title: 'Receipts', value: 'sales/receipts' },
      ],
    },
    {
      title: 'Purchase',
      value: 'purchase',
    },
    {
      title: 'Reports',
      value: 'reports',
    },
    {
      title: 'Core',
      value: 'core_',
    }
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
