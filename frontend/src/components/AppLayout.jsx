import { Layout, Menu, Button } from 'antd';
import {
  DashboardOutlined,
  UnorderedListOutlined,
  ShopOutlined,
  TeamOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Link, Outlet } from 'react-router-dom';

const { Header, Content, Sider } = Layout;

const AppLayout = ({ user, onLogout }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
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
        <Menu theme="dark" mode="inline">
          <Menu.Item key="1" icon={<DashboardOutlined />}>
            <Link to="/">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<UnorderedListOutlined />}>
            <Link to="/routes">Routes</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<ShopOutlined />}>
            <Link to="/inventory">Inventory</Link>
          </Menu.Item>
          <Menu.Item key="4" icon={<TeamOutlined />}>
            <Link to="/users">Users</Link>
          </Menu.Item>
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
