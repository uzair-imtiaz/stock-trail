import React from 'react';
import {
  InputNumber,
  Button,
  Input,
  Card,
  List,
  Typography,
  Space,
  Divider,
  Flex,
} from 'antd';
import {
  DeleteOutlined,
  PlusOutlined,
  DollarOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const ExpensesSection = ({
  expenses,
  onExpenseChange,
  onAddExpense,
  onRemoveExpense,
  totalAmount,
}) => (
  <Card
    title={
      <Space>
        <DollarOutlined />
        <span>Expenses & Summary</span>
      </Space>
    }
    className="mt-6"
    extra={
      <Button type="dashed" icon={<PlusOutlined />} onClick={onAddExpense}>
        Add Expense
      </Button>
    }
    style={{ maxWidth: '50%' }} // Set maxWidth to "50%"
  >
    <List
      itemLayout="horizontal"
      dataSource={expenses}
      className="max-w-3xl"
      renderItem={(expense, index) => (
        <List.Item className="p-2">
          <div className="flex w-full align-items-center gap-2">
            <Flex direction="row">
              <Input
                placeholder="Expense Description"
                value={expense.description}
                onChange={(e) =>
                  onExpenseChange(index, 'description', e.target.value)
                }
                className="flex-grow mb-1"
              />
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onRemoveExpense(index)}
                className="ml-1 flex-none"
              />
            </Flex>
            <InputNumber
              placeholder="Amount"
              min={0}
              value={expense.amount}
              onChange={(value) => onExpenseChange(index, 'amount', value)}
              prefix="PKR"
              className="w-36"
            />
          </div>
        </List.Item>
      )}
      locale={{
        emptyText: 'No expenses added yet',
      }}
    />

    <Divider />

    <div className="flex justify-between items-center max-w-3xl">
      <Text strong>Total Amount:</Text>
      <Text strong className="text-xl">
        PKR {totalAmount.toFixed(2)}
      </Text>
    </div>
  </Card>
);

export default ExpensesSection;
