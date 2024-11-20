/* eslint-disable no-unused-vars */
import React, { useState, useCallback } from 'react';
import { Card, Table, Select, Input, Button, Tag, Menu } from 'antd';
import OfferListData from 'assets/data/offer-list.json';
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
  const [list, setList] = useState(OfferListData);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleShowStatus = (value) => {
    const filteredData = value !== 'All'
      ? utils.filterArray(OfferListData, 'status', value)
      : OfferListData;
    setList(filteredData);
  };

  // Debounce search input
  const handleSearch = useCallback(
    debounce((value) => {
      const searchArray = value ? list : OfferListData;
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
      title: 'Offer Name',
      dataIndex: 'offerName',
      render: (_, record) => <span>{record.offerName}</span>,
      sorter: (a, b) => a.offerName.localeCompare(b.offerName),
    },
    {
      title: 'Discount Percentage',
      dataIndex: 'DiscountPercentage',
      render: (_, record) => <span>{record.DiscountPercentage}</span>,
      sorter: (a, b) => parseFloat(a.DiscountPercentage) - parseFloat(b.DiscountPercentage),
    },
    {
      title: 'Start Date',
      dataIndex: 'StartDate',
      render: (_, record) => <span>{record.StartDate}</span>,
      sorter: (a, b) => new Date(a.StartDate) - new Date(b.StartDate),
    },
    {
      title: 'End Date',
      dataIndex: 'EndDate',
      render: (_, record) => <span>{record.EndDate}</span>,
      sorter: (a, b) => new Date(a.EndDate) - new Date(b.EndDate),
    },
    {
      title: 'Max Users',
      dataIndex: 'MaxUsers',
      render: (_, record) => <span>{record.MaxUsers}</span>,
      sorter: (a, b) => a.MaxUsers - b.MaxUsers,
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
              <Option value="All">All Offers</Option>
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
            onClick={() => navigate(`${APP_PREFIX_PATH}/offer/add`)}
          >
            Add Country
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
