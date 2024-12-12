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
import { fetchAllEvent, handleShowStatus } from "store/slices/eventSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import Flex from "components/shared-components/Flex";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import utils from "utils";
import WarningModal from "components/util-components/ModalItems/WarningModal";

const { Option } = Select;

const scheduleStatusList = ["All", "Scheduled", "Ongoing", "Expired"];

const EventsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { allEvents, filteredEvents ,loading} = useSelector((state) => state.event);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [modalLoading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    dispatch(fetchAllEvent());
  }, [dispatch]);

  const handleViewDetails = (id) => {
    navigate(`${APP_PREFIX_PATH}/event/details`, { state: { eventId: id } });
  };
  

  const handleEditEvent = (id) => {
    navigate(`${APP_PREFIX_PATH}/event/edit/${id}`);
  };

  const handleShowWarning = (event) => {
    setSelectedEvent(event);
    setDialogVisible(true);
  };

  const handleModalSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDialogVisible(false);
      console.log("Confirmed action for event:", selectedEvent);
    }, 2000);
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
          color={record.status ? "green" : "red"} style={{cursor:"pointer"}}
          onClick={() => handleShowWarning(record)}
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
        details="This action will permanently modify your data. Please review the details carefully before proceeding."
        warningMessage="Do you want to continue?"
        onSubmit={handleModalSubmit}
        onCancel={() => setDialogVisible(false)}
        confirmText="Proceed"
        cancelText="Back"
        loading={modalLoading}
      />
    </Card>
  );
};

export default EventsList;
