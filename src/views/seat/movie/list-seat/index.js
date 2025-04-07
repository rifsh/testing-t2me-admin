/* eslint-disable no-unused-vars */
import React, { useState, useCallback } from 'react';
import { Card, Table, Select, Input, Button, Tag, Menu, } from 'antd';
import { EyeOutlined, PlusCircleOutlined, SearchOutlined, FormOutlined } from '@ant-design/icons';
import EllipsisDropdown from 'components/shared-components/EllipsisDropdown';
import Flex from 'components/shared-components/Flex';
  import utils from 'utils';
import { debounce } from 'lodash';
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import seatData from 'assets/data/seat-list.json';
const { Option } = Select;

const SeatList = () => {


  const [list, setList] = useState(seatData);
  const [ setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = useCallback(
    debounce((value) => {
      const searchArray = value ? seatData : list;
      const filteredData = utils.wildCardSearch(searchArray, value);
      setList(filteredData);
      setSelectedRowKeys([]);
    }, 500),
    [list]
  );

  const handleShowStatus = (value) => {
    const filteredData = value !== 'All'
      ? utils.filterArray(seatData, 'status', value)
      : seatData;
    setList(filteredData);
  };

  const getStatusColor = (status) => {
    if (status.toLowerCase() === 'occupied') return 'red';
    if (status.toLowerCase() === 'vacant') return 'green';
    return 'blue';
  };

  const dropdownMenu = (row) => (
    <Menu>
      <Menu.Item>
        <Flex alignItems="center">
          <EyeOutlined />
          <span className="ml-2">View Details</span>
        </Flex>
      </Menu.Item>
      <Menu.Item>
        <Flex alignItems="center">
          <PlusCircleOutlined />
          <span className="ml-2">Add to remark</span>
        </Flex>
      </Menu.Item>
    </Menu>
  );

  const tableColumns = [
    {
      title: 'Venue',
      dataIndex: 'venue',
      sorter: (a, b) => a.venue.localeCompare(b.venue),
    },
    {
      title: 'Section',
      dataIndex: 'section',
      sorter: (a, b) => a.section.localeCompare(b.section),
    },
    {
      title: 'Row',
      dataIndex: 'row',
      sorter: (a, b) => a.row - b.row,
    },
    {
      title: 'Seat Number',
      dataIndex: 'seat_number',
      sorter: (a, b) => a.seat_number - b.seat_number,
    },
    {
      title: 'Price Modifier',
      dataIndex: 'price_modifier',
      render: (_, record) => `$${record.price_modifier.toFixed(2)}`,
    },
    {
      title: 'Is Accessible',
      dataIndex: 'is_accessible',
      render: (_, record) => (record.is_accessible ? 'Yes' : 'No'),
    },
    {
      title: 'Is Available',
      dataIndex: 'is_available',
      render: (_, record) => (record.is_available ? 'Yes' : 'No'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (_, record) => (
        <Tag color={getStatusColor(record.status)}>{record.status}</Tag>
      ),
    },
    {
      title: 'Last Cleaned',
      dataIndex: 'last_cleaned',
      render: (_, record) => new Date(record.last_cleaned).toLocaleString(),
    },
    {
      title: '',
      dataIndex: 'actions',
      render: (_, elm) => (
        <EllipsisDropdown menu={dropdownMenu(elm)} />
      ),
    },
  ];

  const rowSelection = {
    onChange: (key, rows) => {
      setSelectedRows(rows);
      setSelectedRowKeys(key);
    },
  };

  const navigate = useNavigate();

  return (
    <Card>
      <Flex alignItems="center" justifyContent="space-between" mobileFlex={false}>
        <Flex className="mb-1" mobileFlex={false}>
          <div className="mr-md-3 mb-3">
            <Input
              placeholder="Search"
              prefix={<SearchOutlined />}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleSearch(e.target.value);
              }}
              value={searchTerm}
            />
          </div>
          <div className="mb-3">
            <Select
              defaultValue="All"
              className="w-100"
              style={{ minWidth: 180 }}
              onChange={handleShowStatus}
              placeholder="Status"
            >
              <Option value="All">All</Option>
              <Option value="Occupied">Occupied</Option>
              <Option value="Vacant">Vacant</Option>
            </Select>
          </div>
        </Flex>
        <div>
          <Button
            type="primary"
            icon={<FormOutlined />}
            block
            onClick={() => navigate(`${APP_PREFIX_PATH}/seat/movie/add`)}
          >
            Add Seat
          </Button>
        </div>
      </Flex>
      <div className="table-responsive">
        <Table
          columns={tableColumns}
          dataSource={list}
          rowKey="seat_number"
          rowSelection={{
            selectedRowKeys: selectedRowKeys,
            type: 'checkbox',
            preserveSelectedRowKeys: false,
            ...rowSelection,
          }}
        />
      </div>
    </Card>
      );
};

export default SeatList;
