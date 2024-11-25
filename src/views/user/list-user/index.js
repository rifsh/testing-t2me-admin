/* eslint-disable no-unused-vars */
import React, { useState, useCallback } from 'react';
import { Card, Table, Select, Input, Button, Tag, Menu } from 'antd';
import CouponListData from 'assets/data/coupon-list.json';
import UserListdata from "assets/data/user-list.json";
import { EyeOutlined, PlusCircleOutlined, SearchOutlined, FormOutlined } from '@ant-design/icons';
import EllipsisDropdown from 'components/shared-components/EllipsisDropdown';
import Flex from 'components/shared-components/Flex';
import utils from 'utils';
import { useNavigate } from "react-router-dom";
import { debounce } from 'lodash';
import { APP_PREFIX_PATH } from "configs/AppConfig";
const { Option } = Select;


const getStatusColor = (status) => {
  if (status.toLowerCase() === 'active') {
    return 'green';
  }
  if (status.toLowerCase() === 'inactive') {
    return 'red';
  }
  return 'blue'; // For other statuses
};

const OfferList = () => {
  const [list, setList] = useState(UserListdata);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleShowStatus = (value) => {
    const filteredData = value !== 'All'
      ? utils.filterArray(UserListdata, 'status', value)
      : UserListdata;
    setList(filteredData);
  };

  // Debounce search input
  const handleSearch = useCallback(
    debounce((value) => {
      const searchArray = value ? list : UserListdata;
      const filteredData = utils.wildCardSearch(searchArray, value);
      setList(filteredData);
      setSelectedRowKeys([]);
    }, 500),
    [list]
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
      title: 'User Name',
      dataIndex: 'userName',
      render: (_, record) => <span>{record.userName}</span>,
      sorter: (a, b) => a.userName.localeCompare(b.userName),
    },
    {
      title: 'Email',
      dataIndex: 'emailAddress',
      render: (_, record) => <span>{record.emailAddress}</span>,
      sorter: (a, b) => a.emailAddress.localeCompare(b.emailAddress),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      render: (_, record) => <span>{record.role}</span>,
      sorter: (a, b) => a.role.localeCompare(b.role),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (_, record) => <Tag color={getStatusColor(record.status)}>{record.status}</Tag>,
      sorter: (a, b) => a.status.localeCompare(b.status),
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
              <Option value="All">All Users</Option>
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
            onClick={() => navigate(`${APP_PREFIX_PATH}/user/add`)}
          >
            Add User
          </Button>
        </div>
      </Flex>
      <div className="table-responsive">
        <Table
          columns={tableColumns}
          dataSource={list}
          rowKey="offerName"
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

export default OfferList;
