import React from 'react';
import { Table } from 'antd';

const CommonPaginationTable = ({
  columns,
  dataSource,
  loading,
  total,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  rowKey = 'id',
  extraTableProps = {}
}) => {
  const handleChange = (page, newPageSize) => {
    if (newPageSize !== pageSize) {
      onPageSizeChange?.(newPageSize);
      onPageChange?.(1);
    } else {
      onPageChange?.(page);
    }
  };

  return (
    <div className="table-responsive">
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey={rowKey}
        loading={loading}
        pagination={{
          total: total || 0,
          pageSize: pageSize,
          current: currentPage,
          showSizeChanger: true,
          onChange: handleChange,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          defaultPageSize: 10,
          pageSizeOptions: ['10', '20', '30', '40', '50'],
          position: ['bottomRight']
        }}
        {...extraTableProps}
      />
    </div>
  );
};

export default CommonPaginationTable;