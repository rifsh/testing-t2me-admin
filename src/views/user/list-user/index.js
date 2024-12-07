import React, { useEffect } from "react";
import { Card, Table, Select, Input, Button, Tag, Menu } from "antd";
import {
  EyeOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  FormOutlined,
} from "@ant-design/icons";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import Flex from "components/shared-components/Flex";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import {
  fetchAllUsers,
  setSearchTerm,
  setStatusFilter,
  selectFilteredUsers,
} from "store/slices/userSlice";
import { useSelector, useDispatch } from "react-redux";

const { Option } = Select;

const getStatusColor = (is_active) => (is_active ? "green" : "red");

const OfferList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading } = useSelector((state) => state.users);
  const filteredUsers = useSelector(selectFilteredUsers);
  const [setSelectedRows] = React.useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const handleShowStatus = (value) => {
    dispatch(setStatusFilter(value));
    setSelectedRowKeys([]);
  };

  const handleSearch = (e) => {
    dispatch(setSearchTerm(e.target.value));
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
      title: "User Name",
      dataIndex: "username",
      render: (_, record) => <span>{record.username}</span>,
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (_, record) => <span>{record.email}</span>,
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Role",
      dataIndex: "role",
      render: (_, record) => <span>{record.role}</span>,
      sorter: (a, b) => a.role.localeCompare(b.role),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      render: (_, record) => (
        <Tag color={getStatusColor(record.is_active)}>
          {record.is_active ? "Active" : "Inactive"}
        </Tag>
      ),
      sorter: (a, b) => Number(b.is_active) - Number(a.is_active),
    },
    {
      title: "",
      dataIndex: "actions",
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
      <Flex
        alignItems="center"
        justifyContent="space-between"
        mobileFlex={false}
      >
        <Flex className="mb-1" mobileFlex={false}>
          <div className="mr-md-3 mb-3">
            <Input
              placeholder="Search"
              prefix={<SearchOutlined />}
              onChange={handleSearch}
            />
          </div>
          <div className="mb-3">
            <Select
              defaultValue="All"
              className="w-100"
              style={{ minWidth: 180 }}
              onChange={handleShowStatus}
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
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          rowSelection={{
            selectedRowKeys: selectedRowKeys,
            type: "checkbox",
            preserveSelectedRowKeys: false,
            ...rowSelection,
          }}
        />
      </div>
    </Card>
  );
};

export default OfferList;
