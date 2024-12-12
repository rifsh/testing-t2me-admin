import React, { useEffect, useState } from "react";
import { Card, Table, Select, Input, Button, Tag, Menu } from "antd";
import {
  EyeOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  FormOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  editEvent,
  fetchAllEvent,
  fetchEventDetails,
  handleShowStatus,
  setDialogVisible,
  setModalLoading,
  setSelectedEvent,
  // setSubmitData,
} from "store/slices/eventSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import Flex from "components/shared-components/Flex";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import utils from "utils";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import { ActionType } from "utils/api/warning-submit-util";

const { Option } = Select;

const scheduleStatusList = ["All", "Scheduled", "Ongoing", "Expired"];

const EventsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { allEvents, filteredEvents, message, loading, dialogVisible, modalLoading, selectedEvent } =
    useSelector((state) => state.event);

  useEffect(() => {
    dispatch(fetchAllEvent());
  }, [dispatch]);

  const handleViewDetails = async (id) => {
    await dispatch(fetchEventDetails(id));
    navigate(`${APP_PREFIX_PATH}/event/details/${id}`);
  };

  const handleEditEvent = async (id) => {
    navigate(`${APP_PREFIX_PATH}/event/edit/${id}`);
  };

  const handleUpdateStatus = async (event) => {
    const newStatus = !event.status;
    const data = { status: newStatus, id: event.id };
    const resultAction = await dispatch(
      editEvent({ data: data, action: ActionType.WARNING })
    );

    if (editEvent.fulfilled.match(resultAction)) {
      dispatch(setSelectedEvent(data));
      dispatch(setDialogVisible(true));
    }
  };

  const handleModalSubmit = async () => {
    dispatch(setModalLoading(true));
    const resultAction = await dispatch(
      editEvent({ data: selectedEvent, action: ActionType.SUBMIT })
    );
    dispatch(setModalLoading(false));
    dispatch(setDialogVisible(false));
    dispatch(fetchAllEvent());
    if (editEvent.fulfilled.match(resultAction)) {
      message.success(
        `Event ${selectedEvent ? "Activated" : "Deactivated"} successfully`
      );
    }
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
      dataIndex: "category_name",
      sorter: (a, b) => utils.antdTableSorter(a, b, "category_name"),
    },
    {
      title: "Sub Category",
      dataIndex: "sub_category_name",
      sorter: (a, b) => utils.antdTableSorter(a, b, "sub_category_name"),
    },
    {
      title: "Venue",
      dataIndex: "venue_name",
      sorter: (a, b) => utils.antdTableSorter(a, b, "venue_name"),
    },
    {
      title: "Max Tickets",
      dataIndex: "max_tickets",
      sorter: (a, b) => utils.antdTableSorter(a, b, "max_tickets"),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (_, record) => (
        <Tag
          color={record.status ? "green" : "red"}
          style={{ cursor: "pointer" }}
          onClick={() => handleUpdateStatus(record)}
        >
          {record.status ? "Active" : "Inactive"}
        </Tag>
      ),
      sorter: (a, b) => utils.antdTableSorter(a, b, "status"),
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

  const onSearch = (e) => {
    const value = e.currentTarget.value;
    const data = utils.wildCardSearch(allEvents, value);
    dispatch(handleShowStatus(data));
  };

  const handleStatusChange = (value) => {
    dispatch(handleShowStatus(value));
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
              onChange={onSearch}
            />
          </div>
          <div className="mb-3">
            <Select
              defaultValue="All"
              className="w-100"
              style={{ minWidth: 180 }}
              onChange={handleStatusChange}
              placeholder="Status"
            >
              {scheduleStatusList.map((elm) => (
                <Option key={elm} value={elm}>
                  {elm}
                </Option>
              ))}
            </Select>
          </div>
        </Flex>
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
      </Flex>
      <div className="table-responsive">
        <Table
          loading={loading}
          columns={tableColumns}
          dataSource={filteredEvents || allEvents}
          rowKey="id"
        />
      </div>

      <WarningModal
        visible={dialogVisible}
        title="Confirm Action"
        details={message}
        warningMessage="Do you want to continue?"
        onSubmit={handleModalSubmit}
        onCancel={handleModalCancel}
        confirmText="Proceed"
        cancelText="Back"
        loading={modalLoading}
      />
    </Card>
  );
};

export default EventsList;
