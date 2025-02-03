import React, { useEffect, useState } from "react";
import { Card, Table, Select, Input, Button, Menu, message } from "antd";
import {
  EyeOutlined,
  FormOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  editEvent,
  fetchAllEvent,
  fetchEventDetails,
  setModalLoading,
  setDialogVisible,
  setEditItemId,
  editEventStatus,
} from "store/slices/eventSlice";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import Flex from "components/shared-components/Flex";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import utils from "utils";
import { setSelectedItem } from "store/slices/modalSlice";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import { getCurrentUser } from "configs/UserAccessConfig";
import { UserRoleConstants } from "constants/UserRoleConstant";
import { TextConstants } from "constants/TextConstant";
const { Option } = Select;

const scheduleStatusList = ["All", "Scheduled", "Ongoing", "Expired"];

const EventsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const { pagination, editable_status, filteredEvents, messages, loading, dialogVisible,
    modalLoading,
    editItemId,
    responseImpactData, } =
    useSelector((state) => state.event);

  useEffect(() => {
    dispatch(fetchAllEvent(DEFAULT_PAGE_SIZE));
  }, [dispatch]);

  const handleViewDetails = async (id) => {
    await dispatch(fetchEventDetails(id));
    navigate(`${APP_PREFIX_PATH}/event/details/${id}`);
  };

  const handleEditEvent = async (id) => {

    if (currentUser.role_id === UserRoleConstants.eventOrganizerRoleId) {
      const hasPendingUpdates = filteredEvents
        .find(event => event.id === id)?.updates
        .some(update =>
          update.approval_status === 'pending' ||
          update.approval_status === 'updates'
        );

      if (hasPendingUpdates) {
        message.warning('This Event have already pending edit approval');
        return;
      }
    }
    dispatch(setEditItemId(id));
    dispatch(setDialogVisible(true));


  };

  const handleUpdateStatus = (item) => {
    const newStatus = !item.status;
    const data = { status: newStatus, id: item.id };

    dispatch(setSelectedItem(data));
  };
  const handlePagination = (page, size) => {
    dispatch(fetchAllEvent({ page: page, size: size }));
  };
  const handleModalSubmit = async () => {
    dispatch(setModalLoading(true));
    navigate(`${APP_PREFIX_PATH}/event/edit/${editItemId}`);
    dispatch(setDialogVisible(false));
    dispatch(setModalLoading(false));
  };

  const handleModalCancel = () => {
    dispatch(setDialogVisible(false));
  };
  const dropdownMenu = (row) => (
    <Menu>
      <Menu.Item>
        <Flex alignItems="center" onClick={() => handleViewDetails(row.id)}>
          <EyeOutlined />
          <span className="ml-2">View Details</span>
        </Flex>
      </Menu.Item>
      <Menu.Item>
        <Flex alignItems="center" onClick={() => handleEditEvent(row.id)}>
          <EditOutlined />
          <span className="ml-2">Edit Event</span>
        </Flex>
      </Menu.Item>
    </Menu>
  );

  const tableColumns = [
    {
      title: "Event",
      dataIndex: "event_name",
      sorter: (a, b) => utils.antdTableSorter(a, b, "event_name"),
    },
    {
      title: "Category",
      dataIndex: ["category", "name"],
      sorter: (a, b) => utils.antdTableObjectSorter(a, b, ["category", "name"]),
    },
    {
      title: "Sub Category",
      dataIndex: ["sub_category", "name"],
      sorter: (a, b) =>
        utils.antdTableObjectSorter(a, b, ["sub_category", "name"]),
    },
    {
      title: "Venue",
      dataIndex: ["venue", "name"],
      sorter: (a, b) => utils.antdTableObjectSorter(a, b, ["venue", "name"]),
    },
    {
      title: "Place",
      dataIndex: ["venue", "place", "name"],
      sorter: (a, b) => utils.antdTableObjectSorter(a, b, ["venue", "place", "name"]),
    },
    utils.statusColumnUtil(handleUpdateStatus),
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
  const [searchTerm, setSearchTerm] = useState();
  const [activeStatus, setactiveStatus] = useState();
  const handleSearch = (value) => {
    if (value) {
      setSearchTerm(value);
      dispatch(
        fetchAllEvent({
          search: value,
          page: 1,
          size: 10,
          active: activeStatus,
        })
      );
    }
  };
  const handleSearchIsEmpty = (value) => {
    console.log("enterd is empty search");
    if (!value) {
      console.log("is empty search");

      dispatch(
        fetchAllEvent({ search: null, page: 1, size: 10, active: activeStatus })
      );
    }
  };

  const handleShowStatus = (status) => {
    setactiveStatus(status);
    dispatch(
      fetchAllEvent({ search: searchTerm, page: 1, size: 10, active: status })
    );
    // dispatch(filterEvent({ searchTerm: null, status }));
  };
  const { Search } = Input;
  return (
    <Card>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        mobileFlex={false}
      >
        <Flex className="mb-1" mobileFlex={false}>
          <div className="mr-md-3 mb-3">
            <Search
              placeholder="Search Event"
              onChange={(e) => handleSearchIsEmpty(e.target.value)}
              onSearch={(value) => handleSearch(value)}
              style={{ width: 200 }}
            />
          </div>
          <div className="mb-3">
            <Select
              defaultValue="All"
              onChange={handleShowStatus}
              className="mr-2"
            >
              <Option value={null}>All</Option>
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>
          </div>
        </Flex>
        {currentUser.role_id !== UserRoleConstants.eventOrganizerRoleId && (
          <div>
            <Button
              type="primary"
              icon={<FormOutlined />}
              block
              onClick={() => navigate(`${APP_PREFIX_PATH}/event/add`)}
            >
              Add Event
            </Button>
          </div>
        )}
      </Flex>
      <div className="table-responsive">
        <Table
          columns={tableColumns}
          dataSource={filteredEvents}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.size,
            total: pagination.total,
            onChange: (page, pageSize) => handlePagination(page, pageSize),
          }}
        />
      </div>
      <WarningModal
        mode={"itemmodal"}
        visible={dialogVisible}
        title="Edit Place"
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
        responseData={responseImpactData}
        tableConfig={{
          title: "Active Schedules",
          dataKey: "active_schedules"
        }}
        pageData={{ page: 1, size: 10 }}
      />
    </Card>
  );
};

export default EventsList;
