import React, { useRef } from 'react';
import { Table, Button, Typography } from 'antd';
import { useReactToPrint } from 'react-to-print';
import { IoPrintOutline } from 'react-icons/io5';

const PrintTable = ({ title, columns, data, loading }) => {
  const tableRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => tableRef.current,
    documentTitle: title,
  });

  return (
    <div>
      <Typography.Title level={3}>{title}</Typography.Title>

      <Button type="default" icon={<IoPrintOutline />} onClick={handlePrint} className="mb-3">
        Print
      </Button>

      <div ref={tableRef}>
        <Table columns={columns} dataSource={data} bordered loading={loading} />
      </div>
    </div>
  );
};

export default PrintTable;
