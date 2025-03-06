import {
  BarChartOutlined,
  CompassOutlined,
  FileAddOutlined,
  FileTextOutlined,
  InboxOutlined,
  LogoutOutlined,
  MoneyCollectOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  TableOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu } from 'antd';
import { useState } from 'react';
import { BsBank } from 'react-icons/bs';
import { GoGear } from 'react-icons/go';
import { IoReceiptOutline } from 'react-icons/io5';
import { Link, Outlet } from 'react-router-dom';
import { getPermission } from '../utils';

const { Header, Content, Sider } = Layout;

const siderStyle = {
  overflow: 'auto',
  height: '100vh',
  position: 'sticky',
  insetInlineStart: 0,
  top: 0,
  bottom: 0,
  scrollbarWidth: 'thin',
  scrollbarGutter: 'stable',
};

const AppLayout = ({ user, onLogout }) => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        style={siderStyle}
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
      >
        <div
          className="logo"
          style={{
            color: 'white',
            padding: '16px',
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          Stock Trail
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
          {/* <Menu.Item key="1" icon={<HomeOutlined />}>
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              Dashboard
            </Link>
          </Menu.Item> */}
          {getPermission(user, 'routes') && (
            <Menu.Item key="2" icon={<CompassOutlined />}>
              <Link to="/routes" style={{ textDecoration: 'none' }}>
                Routes
              </Link>
            </Menu.Item>
          )}
          {getPermission(user, 'inventory') && (
            <Menu.SubMenu key="3" icon={<InboxOutlined />} title="Inventory">
              <Menu.Item key="3-1" icon={<TableOutlined />}>
                <Link to="/inventory" style={{ textDecoration: 'none' }}>
                  Listing
                </Link>
              </Menu.Item>
              <Menu.Item key="3-2" icon={<BarChartOutlined />}>
                <Link
                  to="/inventory/stock-management"
                  style={{ textDecoration: 'none' }}
                >
                  Stock Management
                </Link>
              </Menu.Item>
            </Menu.SubMenu>
          )}
          {getPermission(user, 'sales') && (
            <Menu.SubMenu key="6" icon={<ShoppingCartOutlined />} title="Sales">
              <Menu.Item key="6-1" icon={<FileAddOutlined />}>
                <Link to="/sales" style={{ textDecoration: 'none' }}>
                  Add Sale
                </Link>
              </Menu.Item>
              <Menu.Item key="6-2" icon={<FileTextOutlined />}>
                <Link to="/invoices" style={{ textDecoration: 'none' }}>
                  Invoices
                </Link>
              </Menu.Item>
              <Menu.Item key="6-3" icon={<IoReceiptOutline />}>
                <Link to="/receipts" style={{ textDecoration: 'none' }}>
                  Receipts
                </Link>
              </Menu.Item>
            </Menu.SubMenu>
          )}
          {getPermission(user, 'users') && (
            <Menu.Item key="4" icon={<UsergroupAddOutlined />}>
              <Link to="/users" style={{ textDecoration: 'none' }}>
                Users
              </Link>
            </Menu.Item>
          )}
          {getPermission(user, 'purchase') && (
            <Menu.Item key="5" icon={<ShoppingOutlined />}>
              <Link to="/purchase" style={{ textDecoration: 'none' }}>
                Purchase
              </Link>
            </Menu.Item>
          )}
          {getPermission(user, 'core') && (
            <Menu.SubMenu key="7" icon={<GoGear />} title="Core">
              <Menu.Item key="7-1" icon={<ShoppingOutlined />}>
                <Link to="/core/shops" style={{ textDecoration: 'none' }}>
                  Shops
                </Link>
              </Menu.Item>
              <Menu.Item key="7-2" icon={<BsBank />}>
                <Link to="/core/accounts" style={{ textDecoration: 'none' }}>
                  Accounts
                </Link>
              </Menu.Item>
              <Menu.Item key="7-3" icon={<MoneyCollectOutlined />}>
                <Link to="/core/expenses" style={{ textDecoration: 'none' }}>
                  Expenses
                </Link>
              </Menu.Item>
            </Menu.SubMenu>
          )}
        </Menu>
      </Sider>

      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>Welcome, {user?.name}</span>
          <Button type="link" icon={<LogoutOutlined />} onClick={onLogout}>
            Logout
          </Button>
        </Header>
        <Content style={{ margin: '16px' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;

// can give a core module to maintain stock type and pieces per carton
