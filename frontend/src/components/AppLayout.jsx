import { Layout, Menu, Button } from 'antd';
import {
  DashboardOutlined,
  UnorderedListOutlined,
  ShopOutlined,
  TeamOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Link, Outlet } from 'react-router-dom';
import { getPermission } from '../utils';
import { useState } from 'react';

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
          <Menu.Item key="1" icon={<DashboardOutlined />}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              Dashboard
            </Link>
          </Menu.Item>
          {getPermission(user, 'routes') && (
            <Menu.Item key="2" icon={<UnorderedListOutlined />}>
              <Link to="/routes" style={{ textDecoration: 'none' }}>
                Routes
              </Link>
            </Menu.Item>
          )}
          {getPermission(user, 'inventory') && (
            <Menu.Item key="3" icon={<ShopOutlined />}>
              <Link to="/inventory" style={{ textDecoration: 'none' }}>
                Inventory
              </Link>
            </Menu.Item>
          )}
          {getPermission(user, 'users') && (
            <Menu.Item key="4" icon={<TeamOutlined />}>
              <Link to="/users" style={{ textDecoration: 'none' }}>
                Users
              </Link>
            </Menu.Item>
          )}
          {getPermission(user, 'sales') && (
            <Menu.Item key="5" icon={<ShopOutlined />}>
              <Link to="/sales" style={{ textDecoration: 'none' }}>
                Sales
              </Link>
            </Menu.Item>
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
