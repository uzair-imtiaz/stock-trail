import { Table } from 'antd';
import { createGlobalStyle } from 'styled-components';

const PrintStyles = createGlobalStyle`
  @media print {
    .ant-layout-header,
    .ant-layout-sider,
    .ant-table-pagination,
    .ant-table-filter-trigger,
    .ant-table-filter-trigger-container,
    .ant-table-column-sorter,
    .ant-table-filter-dropdown,
    .ant-select,
    .ant-picker,
    .ant-btn,
    .ant-space {
      display: none !important;
    }
    .ant-layout-content {
      margin: 0 !important;
      padding: 0 !important;
    }
    .ant-table {
      border: none !important;
    }
    .ant-table-cell {
      padding: 8px !important;
    }
    @page {
      size: landscape;
      margin: 20mm 10mm;
    }
  }
`;

const PrintTable = ({ columns, data, loading }) => {
  return (
    <div>
      <PrintStyles />
      <Table
        columns={columns}
        dataSource={data}
        bordered
        loading={loading}
        pagination={false}
        sticky
      />
    </div>
  );
};

export default PrintTable;
