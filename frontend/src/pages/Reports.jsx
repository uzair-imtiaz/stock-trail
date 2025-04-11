import {
  CreditCardOutlined,
  DollarOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import { Avatar, Badge, Card, List, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Title } = Typography;

const REPORTS = [
  {
    name: 'Expense',
    icon: <DollarOutlined />,
    color: '#f5222d',
    description: 'Track and manage your expenses',
  },
  {
    name: 'Credits',
    icon: <CreditCardOutlined />,
    color: '#722ed1',
    description: 'Monitor available credits and transactions',
  },
  {
    name: 'Sale',
    icon: <ShoppingCartOutlined />,
    color: '#52c41a',
    description: 'View sales performance and analytics',
  },
  // {
  //   name: 'Purchase',
  //   icon: <ShoppingOutlined />,
  //   color: '#1890ff',
  //   description: 'Manage purchase orders and suppliers',
  // },
];

const Reports = () => {
  return (
    <Card
      title={<Title level={4}>Reports Dashboard</Title>}
      bordered={false}
      className="reports-card"
    >
      <List
        itemLayout="horizontal"
        dataSource={REPORTS}
        renderItem={(item) => (
          <List.Item
            style={{
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              padding: '12px 24px',
              borderRadius: '4px',
            }}
            className="hover:bg-gray-50"
          >
            <List.Item.Meta
              avatar={
                <Badge color={item.color}>
                  <Avatar
                    icon={item.icon}
                    style={{ backgroundColor: item.color, color: '#fff' }}
                    size="large"
                  />
                </Badge>
              }
              title={
                <Link
                  to={item.name}
                  style={{
                    fontSize: '16px',
                    fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  {item.name}
                </Link>
              }
              description={item.description}
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default Reports;
