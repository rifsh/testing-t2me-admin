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
  EditOutlined,
} from "@ant-design/icons";
import Flex from "components/shared-components/Flex";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEventType,
  editEventStatus,
  fetchAllEvent,
  filterEvent,
  setModalLoading,
  setDialogVisible,
  setEditItemId,
} from "store/slices/eventSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import {
  setDialogVisible as setModalDialogVisible,
  setSelectedItem,
} from "store/slices/modalSlice";
import Utils from "utils";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import { TextConstants } from "constants/TextConstant";
import StatusSubmitAndConfirmModal from "components/util-components/ModalItems/StatusSubmitModal";

const { Option } = Select;

const EventTypeList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    eventType,
    pagination,
    editable_status,
    loading,
    messages,
    editItemId,
    dialogVisible,
    warningPagination,
    modalLoading,
    responseImpactData,
  } = useSelector((state) => state.event);
  const { responseData } = useSelector((state) => state.modalSlice);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState(null);

  useEffect(() => {
    dispatch(fetchEventType(DEFAULT_PAGE_SIZE));
  }, [dispatch]);

  const handlePagination = (page, size) => {
    dispatch(fetchEventType({ page: page, size: size }));
  };

  const showModal = (eventType) => {
    setSelectedEventType(eventType);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedEventType(null);
  };

  const handleUpdateStatus = (item) => {
    const newStatus = !item.status;
    const data = { status: newStatus, id: item.id };
    dispatch(setSelectedItem(data));
    dispatch(setModalDialogVisible(true));
  };

  const handleEditType = (id) => {
    dispatch(setEditItemId(id));
    dispatch(setDialogVisible(true));
  };

  const handleModalSubmit = async () => {
    dispatch(setModalLoading(true));
    navigate(`${APP_PREFIX_PATH}/event/type/edit/${editItemId}`);
    dispatch(setDialogVisible(false));
    dispatch(setModalLoading(false));
  };

  const handleModalCancel = () => {
    dispatch(setDialogVisible(false));
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
          <span className="ml-2">Edit Event Type</span>
        </Flex>
      ),
      onClick: () => handleEditType(row.id),
    },
  ];

  const tableColumns = [
    {
      title: "Type Name",
      dataIndex: "name",
      sorter: (a, b) => Utils.antdTableSorter(a, b, "name"),
    },
    {
      title: "Name",
      dataIndex: "display_name",
      sorter: (a, b) => Utils.antdTableSorter(a, b, "display_name"),
    },
    {
      title: "Description",
      dataIndex: "description",
      sorter: (a, b) => Utils.antdTableSorter(a, b, "description"),
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
      <Flex alignItems="center" className="mb-3" justifyContent="space-between">
        <SearchBarWithStatus fetchFunction={fetchAllEvent} />
        <Button
          type="primary"
          icon={<FormOutlined />}
          onClick={() => navigate(`${APP_PREFIX_PATH}/event/type/add`)}
        >
          Add Event Type
        </Button>
      </Flex>

      <Table
        columns={tableColumns}
        dataSource={eventType}
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
        title="Event Type Details"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        {selectedEventType && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Type Name">
              {selectedEventType.name}
            </Descriptions.Item>
            <Descriptions.Item label="Display Name">
              {selectedEventType.display_name}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {selectedEventType.description || "No description available"}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {selectedEventType.status ? "Active" : "Inactive"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <WarningModal
        mode={"itemmodal"}
        visible={dialogVisible}
        title="Edit Event Type"
        details={TextConstants.DefaultEditContent1}
        warningMessage="Do you want to proceed to the edit page?"
        onSubmit={handleModalSubmit}
        onCancel={handleModalCancel}
        confirmText="Proceed to Edit"
        cancelText="Cancel"
        loading={modalLoading}
      />

      <UpdateStatusModal
        responseMessage={messages}
        editFunction={editEventStatus}
        editable_status={editable_status}
        getAllFunction={(pageData) => fetchAllEvent(pageData)}
        pageData={{ page: 1, size: 10 }}
        tableConfig={{
          title: "Active Schedules",
          dataKey: "items",
        }}
        responseData={responseImpactData}
        pagination={warningPagination}
        loading={loading}
      />

      <StatusSubmitAndConfirmModal
        editFunction={editEventStatus}
        getAllFunction={fetchAllEvent}
        responseData={responseData}
        responseMessage={messages}
        pageData={DEFAULT_PAGE_SIZE}
        onSubmitMessage={TextConstants.StatusUpdatedSuccess}
        onCloseMessage={TextConstants.StatusUpdateCanceled}
      />
    </Card>
  );
};

export default EventTypeList;
