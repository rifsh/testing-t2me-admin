/* eslint-disable no-unused-vars */
import React, { useState, useCallback, useEffect } from 'react';
import { Card, Table, Select, Input, Button, Tag, Menu } from 'antd';
import { EyeOutlined, PlusCircleOutlined, SearchOutlined, FormOutlined } from '@ant-design/icons';
import EllipsisDropdown from 'components/shared-components/EllipsisDropdown';
import Flex from 'components/shared-components/Flex';
import utils from 'utils';
import { useNavigate } from "react-router-dom";
import { debounce } from 'lodash';
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { setUserList, fetchAllUsers } from 'store/slices/userSlice';
import { useSelector, useDispatch } from 'react-redux';
const { Option } = Select;


const getStatusColor = (is_active) => {
  if (is_active === true) {
    return 'green';
  }
  if (is_active === false) {
    return 'red';
  }
  return 'blue';
};

const OfferList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list, loading, error } = useSelector((state) => state.users);
  const [originalList, setOriginalList] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');


  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  useEffect(() => {
    if (list.length > 0) {
      setOriginalList(list);
    }
  }, [list]);


  const filteredAndSearchedList = React.useMemo(() => {
    let result = originalList;
    if (statusFilter !== 'All') {
      const isActive = statusFilter === 'Active';
      result = result.filter(user => user.is_active === isActive);
    }
    if (searchTerm) {
      result = utils.wildCardSearch(result, searchTerm);
    }

    return result;
  }, [originalList, statusFilter, searchTerm]);

  const handleShowStatus = (value) => {
    setStatusFilter(value);
    setSelectedRowKeys([]);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setSelectedRowKeys([]);
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
      title: 'User Name',
      dataIndex: 'username',
      render: (_, record) => <span>{record.username}</span>,
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      render: (_, record) => <span>{record.email}</span>,
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      render: (_, record) => <span>{record.role}</span>,
      sorter: (a, b) => a.role.localeCompare(b.role),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      render: (_, record) => <Tag color={getStatusColor(record.is_active)}>{record.is_active ? "Active" : "InActive"}</Tag>,
      sorter: (a, b) => Number(b.is_active) - Number(a.is_active),
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
          dataSource={filteredAndSearchedList}
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
