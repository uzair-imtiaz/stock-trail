import React from 'react';
import {
  InputNumber,
  Button,
  List,
  Typography,
  Space,
  Divider,
  Flex,
  Select,
} from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Card } from './common';

const { Text } = Typography;

const DynamicListSection = ({
  title,
  icon,
  items,
  setItems,
  totalAmount,
  selectOptions,
  selectPlaceholder,
  numberPlaceholder,
  showTotalAmount = true,
  width = '50%',
  totalText = 'Total Amount',
}) => {
  const handleItemChange = (index, field, value) => {
    const updatedExpenses = items.map((expense, i) =>
      i === index ? { ...expense, [field]: value } : expense
    );
    setItems(updatedExpenses);
  };

  const handleAddItem = () => {
    setItems([...items, { description: '', amount: 0 }]);
  };

  const handleRemoveItem = (index) => {
    const updatedExpenses = items.filter((_, i) => i !== index);
    setItems(updatedExpenses);
  };

  return (
    <Card
      title={
        <Space>
          {icon}
          <span>{title}</span>
        </Space>
      }
      className="mt-3"
      extra={
        <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddItem}>
          Add Item
        </Button>
      }
      style={{ maxWidth: width }}
    >
      <List
        itemLayout="horizontal"
        dataSource={items}
        className="max-w-3xl"
        renderItem={(item, index) => (
          <List.Item className="p-2">
            <div className="flex w-full align-items-center gap-2">
              <Flex direction="row">
                <Select
                  placeholder={selectPlaceholder}
                  onChange={(value) =>
                    handleItemChange(index, 'description', value)
                  }
                  allowClear
                  value={item?.description || null}
                  className="flex-grow mb-1 w-100"
                  disabled={item?.disabled}
                  options={selectOptions}
                />
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveItem(index)}
                  disabled={item?.disabled}
                  className="ml-1 flex-none"
                />
              </Flex>
              <InputNumber
                placeholder={numberPlaceholder}
                min={0}
                value={item.amount}
                onChange={(value) => handleItemChange(index, 'amount', value)}
                prefix="PKR"
                disabled={item?.disabled}
                className="w-75"
              />
            </div>
          </List.Item>
        )}
        locale={{
          emptyText: 'No items added yet',
        }}
      />

      {showTotalAmount && (
        <>
          <Divider />
          <div className="flex justify-between items-center max-w-3xl">
            <Text strong>{totalText}:&nbsp;</Text>
            <Text strong className="text-xl">
              PKR {totalAmount.toFixed(2)}
            </Text>
          </div>
        </>
      )}
    </Card>
  );
};

export default DynamicListSection;
