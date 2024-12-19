import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Select,
  Input,
  Button,
  Modal,
  Descriptions,
  Dropdown,
} from "antd";
import {
  EyeOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  FormOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import Flex from "components/shared-components/Flex";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers, filterUsers, editUser } from "store/slices/userSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import {
  setDialogVisible,
  setSelectedItem,
} from "store/slices/modalSlice";
import Utils from "utils";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";

const { Option } = Select;

const UserList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { filteredUsers, loading, message } = useSelector(
    (state) => state.users
  );

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const handleSearch = (e) => {
    dispatch(filterUsers({ searchTerm: e.target.value, status: null }));
  };

  const handleShowStatus = (status) => {
    dispatch(filterUsers({ searchTerm: null, status }));
  };

  const showModal = (user) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedUser(null);
  };

  const handleUpdateStatus = (item) => {
    const newStatus = !item.status;
    const data = { status: newStatus, id: item.id };

    dispatch(setSelectedItem(data));
  };

  const getDropdownMenu = (row) => [
    {
      key: "view",
      label: (
        <Flex alignItems="center">
          <EyeOutlined />
          <span className="ml-2">View Details</span>
        </Flex>
      ),
      onClick: () => showModal(row),
    },
    {
      key: "remark",
      label: (
        <Flex alignItems="center">
          <PlusCircleOutlined />
          <span className="ml-2">Add to remark</span>
        </Flex>
      ),
    },
  ];

  const tableColumns = [
    {
      title: "User Name",
      dataIndex: "username",
      sorter: (a, b) => Utils.antdTableSorter(a, b, "username"),
    },
    {
      title: "Email",
      dataIndex: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Role",
      dataIndex: "role",
      sorter: (a, b) => a.role.localeCompare(b.role),
    },
    Utils.statusColumnUtil(handleUpdateStatus),
    {
      title: "",
      dataIndex: "actions",
      render: (_, row) => (
        <Dropdown menu={{ items: getDropdownMenu(row) }} trigger={["click"]}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <Card>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        style={{ paddingBottom: "30px" }}
      >
        <Flex>
          <Input
            placeholder="Search"
            prefix={<SearchOutlined />}
            onChange={handleSearch}
            className="mr-2"
          />
          <Select
            defaultValue="All"
            onChange={handleShowStatus}
            className="mr-2"
          >
            <Option value="All">All</Option>
            <Option value="Active">Active</Option>
            <Option value="Inactive">Inactive</Option>
          </Select>
        </Flex>
        <Button
          type="primary"
          icon={<FormOutlined />}
          onClick={() => navigate(`${APP_PREFIX_PATH}/user/add`)}
        >
          Add User
        </Button>
      </Flex>
      <Table
        columns={tableColumns}
        dataSource={filteredUsers}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="User Details"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        {selectedUser && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="User Name">
              {selectedUser.username}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedUser.email}
            </Descriptions.Item>
            <Descriptions.Item label="Role">
              {selectedUser.role}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {selectedUser.status ? "Active" : "Inactive"}
            </Descriptions.Item>
            <Descriptions.Item label="Additional Info">
              {selectedUser.info || "No additional information available"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <UpdateStatusModal
        responseMessage={message}
        editFunction={editUser}
        getAllFunction={fetchAllUsers}
      />
    </Card>
  );
};

export default UserList;
