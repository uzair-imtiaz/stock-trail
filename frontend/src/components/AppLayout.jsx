import {
  BarChartOutlined,
  CompassOutlined,
  FileAddOutlined,
  FileTextOutlined,
  FundViewOutlined,
  InboxOutlined,
  LogoutOutlined,
  MoneyCollectOutlined,
  PercentageOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  TableOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Layout, Menu } from 'antd';
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
  backgroundColor: '#F5F5F0',
};

const AppLayout = ({ user, onLogout }) => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        theme="light"
        trigger={null}
        style={siderStyle}
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
      >
        <div className="logo" style={{ backgroundColor: '#F5F5F0' }}>
          <img
            src={
              collapsed
                ? '/assets/images/logo.png'
                : '/assets/images/logo-expanded.png'
            }
            alt="logo"
            style={{
              width: '100%',
              maxHeight: 64,
              objectFit: 'cover',
            }}
          />
        </div>
        <Menu
          style={{ backgroundColor: '#F5F5F0' }}
          theme="light"
          mode="inline"
        >
          {getPermission(user, 'reports') && (
            <Menu.Item key="1" icon={<FundViewOutlined />}>
              <Link to="/reports" style={{ textDecoration: 'none' }}>
                Reports
              </Link>
            </Menu.Item>
          )}

          {getPermission(user, 'routes') && (
            <Menu.Item key="2" icon={<CompassOutlined />}>
              <Link to="/routes" style={{ textDecoration: 'none' }}>
                Routes
              </Link>
            </Menu.Item>
          )}

          {getPermission(user, 'inventory') && (
            <Menu.SubMenu key="3" icon={<InboxOutlined />} title="Inventory">
              {getPermission(user, 'inventory') && (
                <Menu.Item key="3-1" icon={<TableOutlined />}>
                  <Link to="/inventory" style={{ textDecoration: 'none' }}>
                    Listing
                  </Link>
                </Menu.Item>
              )}
              {getPermission(user, 'inventory') && (
                <Menu.Item key="3-2" icon={<BarChartOutlined />}>
                  <Link
                    to="/inventory/stock-management"
                    style={{ textDecoration: 'none' }}
                  >
                    Stock Management
                  </Link>
                </Menu.Item>
              )}
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

          {getPermission(user, 'sales') && (
            <Menu.SubMenu key="6" icon={<ShoppingCartOutlined />} title="Sales">
              {getPermission(user, 'sales') && (
                <Menu.Item key="6-1" icon={<FileAddOutlined />}>
                  <Link to="/sales" style={{ textDecoration: 'none' }}>
                    Add Sale
                  </Link>
                </Menu.Item>
              )}
              {getPermission(user, 'sales') && (
                <Menu.Item key="6-2" icon={<FileTextOutlined />}>
                  <Link to="/sales/invoices" style={{ textDecoration: 'none' }}>
                    Invoices
                  </Link>
                </Menu.Item>
              )}
              {getPermission(user, 'sales') && (
                <Menu.Item key="6-3" icon={<IoReceiptOutline />}>
                  <Link to="/sales/receipts" style={{ textDecoration: 'none' }}>
                    Receipts
                  </Link>
                </Menu.Item>
              )}
            </Menu.SubMenu>
          )}

          {getPermission(user, 'core') && (
            <Menu.SubMenu key="7" icon={<GoGear />} title="Core">
              {getPermission(user, 'core') && (
                <Menu.Item key="7-1" icon={<ShoppingOutlined />}>
                  <Link to="/core/shops" style={{ textDecoration: 'none' }}>
                    Shops
                  </Link>
                </Menu.Item>
              )}
              {getPermission(user, 'core') && (
                <Menu.Item key="7-2" icon={<BsBank />}>
                  <Link to="/core/accounts" style={{ textDecoration: 'none' }}>
                    Accounts
                  </Link>
                </Menu.Item>
              )}
              {getPermission(user, 'core') && (
                <Menu.Item key="7-3" icon={<MoneyCollectOutlined />}>
                  <Link to="/core/expenses" style={{ textDecoration: 'none' }}>
                    Expenses
                  </Link>
                </Menu.Item>
              )}
              {getPermission(user, 'core') && (
                <Menu.Item key="7-4" icon={<PercentageOutlined />}>
                  <Link
                    to="/core/deductions"
                    style={{ textDecoration: 'none' }}
                  >
                    Deductions/Charges
                  </Link>
                </Menu.Item>
              )}
              {getPermission(user, 'core') && (
                <Menu.Item key="7-5" icon={<ShopOutlined />}>
                  <Link to="/core/vendors" style={{ textDecoration: 'none' }}>
                    Vendors
                  </Link>
                </Menu.Item>
              )}
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
          <section>
            <Avatar style={{ backgroundColor: '#0f4741' }}>
              {user?.tenant?.name?.toUpperCase()?.[0]}
            </Avatar>
            <span style={{ marginLeft: '10px' }}>Welcome {user?.name}</span>
          </section>
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
