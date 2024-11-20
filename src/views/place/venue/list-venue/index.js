/* eslint-disable no-unused-vars */
import React, { useState, useCallback } from 'react';
import { Card, Table, Select, Input, Button, Badge, Menu, Tag } from 'antd';
import CountryListData from 'assets/data/venue-list.json';
import { EyeOutlined, FormOutlined, SearchOutlined, PlusCircleOutlined } from '@ant-design/icons';
import EllipsisDropdown from 'components/shared-components/EllipsisDropdown';
import Flex from 'components/shared-components/Flex';
import dayjs from 'dayjs';
import { DATE_FORMAT_DD_MM_YYYY } from 'constants/DateConstant';
import utils from 'utils';
import { useNavigate } from 'react-router-dom';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import { debounce } from 'lodash';

const { Option } = Select;

const getStatusColor = (status) => {
  if (status === 'active') {
    return 'green';
  }
  if (status === 'inactive') {
    return 'red';
  }
  return '';
};

const CountryList = () => {
  const [list, setList] = useState(CountryListData);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleShowStatus = (value) => {
    const filteredData = value !== 'All'
      ? utils.filterArray(CountryListData, 'status', value)
      : CountryListData;
    setList(filteredData);
  };

  // Debounce search input
  const handleSearch = useCallback(
    debounce((value) => {
      const searchArray = value ? list : CountryListData;
      const filteredData = utils.wildCardSearch(searchArray, value);
      setList(filteredData);
      setSelectedRowKeys([]);
    }, 500),
    []
  );

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
      render: (_, record) => <span>{record.venue}</span>,
      sorter: (a, b) => utils.antdTableSorter(a, b, 'venue'),
    },
    {
      title: 'Place',
      dataIndex: 'place',
      render: (_, record) => <span>{record.place}</span>,
      sorter: (a, b) => utils.antdTableSorter(a, b, 'place'),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      render: (_, record) => <span>{record.address}</span>,
      sorter: (a, b) => utils.antdTableSorter(a, b, 'address'),
    },
    {
      title: 'Is Indoor',
      dataIndex: 'isIndoor',
      render: (_, record) => <span>{record.isIndoor ? 'Yes' : 'No'}</span>,
      sorter: (a, b) => utils.antdTableSorter(a, b, 'isIndoor'),
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      render: (_, record) => <span>{record.capacity}</span>,
      sorter: (a, b) => utils.antdTableSorter(a, b, 'capacity'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (_, record) => <Tag color={getStatusColor(record.status)}>{record.status}</Tag>,
      sorter: (a, b) => utils.antdTableSorter(a, b, 'status'),
    },
    {
      title: '',
      dataIndex: 'actions',
      render: (_, elm) => (
        <div className="text-right">
          <EllipsisDropdown menu={dropdownMenu(elm)} />
        </div>
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
              <Option value="All">All status</Option>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </div>
        </Flex>
        <div>
          <Button
            type="primary"
            icon={<FormOutlined />}
            block
            onClick={() => navigate(`${APP_PREFIX_PATH}/venue/add`)}
          >
            Add Venue
          </Button>
        </div>
      </Flex>
      <div className="table-responsive">
        <Table
          columns={tableColumns}
          dataSource={list}
          rowKey="venue"
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

export default CountryList;
