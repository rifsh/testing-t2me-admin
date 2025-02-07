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
  EditOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  FormOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import Flex from "components/shared-components/Flex";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllUsers,
  filterUsers,
  editUser,
  updateUserStatus,
} from "store/slices/userSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { setSelectedItem, setDialogVisible } from "store/slices/modalSlice";
import Utils from "utils";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import { getCurrentUser } from "configs/UserAccessConfig";
import { UserRoleConstants } from "constants/UserRoleConstant";
import { TextConstants } from "constants/TextConstant";
import StatusSubmitAndConfirmModal from "components/util-components/ModalItems/StatusSubmitModal";

const { Option } = Select;

const UserList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    filteredUsers,
    pagination,
    loading,
    editable_status,
    message,
    responseImpactData,
    responseData,
  } = useSelector((state) => state.users);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    dispatch(fetchAllUsers(DEFAULT_PAGE_SIZE));
  }, [dispatch]);
  const handlePagination = (page, size) => {
    dispatch(fetchAllUsers({ page: page, size: size }));
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
    if (getCurrentUser().role_id == UserRoleConstants.superAdminRoleId) {
      const newStatus = !item.is_active;
      const data = { status: newStatus, id: item.id };

      dispatch(setSelectedItem(data));
      dispatch(setDialogVisible(true));
    }
  };

  const handleEditUser = async (userId) => {
    navigate(`${APP_PREFIX_PATH}/user/edit/${userId}`);
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
      key: "edit",
      label: (
        <Flex alignItems="center">
          <EditOutlined />
          <span className="ml-2">Edit User</span>
        </Flex>
      ),
      onClick: () => handleEditUser(row.id),
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
      dataIndex: ["role", "name"],
      sorter: (a, b) => Utils.antdTableSorter(a, b, ["role", "name"]),
    },
    Utils.statusColumnUtil(handleUpdateStatus, "is_active"),
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
        <SearchBarWithStatus fetchFunction={fetchAllUsers} />
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
        pagination={{
          current: pagination.page,
          pageSize: pagination.size,
          total: pagination.total,
          onChange: (page, pageSize) => handlePagination(page, pageSize),
        }}
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
              {selectedUser.role?.name || "No role assigned"}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {selectedUser.is_active ? "Active" : "Inactive"}
            </Descriptions.Item>
            {/* <Descriptions.Item label="Event Name">"Additional Info" */}
            <Descriptions.Item label="Event Name">
              {/* {selectedUser.events || "No additional information available"} */}
              {selectedUser.events && Array.isArray(selectedUser.events)
                ? selectedUser.events.map((event, index) => (
                    <span key={event.id}>
                      {event.event_name}
                      {index < selectedUser.events.length - 1 && ", "}
                    </span>
                  ))
                : "No additional information available"}
            </Descriptions.Item>
            {selectedUser.thumbnail_image &&
            selectedUser.thumbnail_image !== "images" ? (
              <Descriptions.Item label="Thumbnail Image">
                <img
                  src={selectedUser.thumbnail_image}
                  alt="Offer Thumbnail"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    objectFit: "contain",
                  }}
                />
              </Descriptions.Item>
            ) : (
              <Descriptions.Item label="Thumbnail Image">
                No image available
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      <UpdateStatusModal
        responseMessage={message}
        editFunction={updateUserStatus}
        getAllFunction={(pageData) => fetchAllUsers(pageData)}
        pageData={{ page: 1, size: 10 }}
        tableConfig={{
          title: "Active Schedules",
          dataKey: "active_schedules",
        }}
        editable_status={editable_status}
        responseData={responseImpactData}
      />
      <StatusSubmitAndConfirmModal
        editFunction={updateUserStatus}
        getAllFunction={fetchAllUsers}
        responseData={responseData}
        responseMessage={message}
        pageData={DEFAULT_PAGE_SIZE}
        onSubmitMessage={TextConstants.StatusUpdatedSuccess}
        onCloseMessage={TextConstants.StatusUpdateCanceled}
      />
    </Card>
  );
};

export default UserList;
