import { createRoot } from 'react-dom/client';
import 'antd/dist/reset.css';
import App from './App.jsx';
import { themeConfig } from './configs/antd.theme.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ConfigProvider } from 'antd';

createRoot(document.getElementById('root')).render(
  <ConfigProvider theme={themeConfig}>
    <App />
  </ConfigProvider>
);
