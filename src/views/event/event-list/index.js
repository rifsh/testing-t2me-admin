import React, { useEffect } from "react";
import { Card, Table, Select, Input, Button, Menu } from "antd";
import {
  EyeOutlined,
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
  filterEvent,
  handleShowStatus,
} from "store/slices/eventSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import Flex from "components/shared-components/Flex";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import utils from "utils";
import { setDialogVisible, setSelectedItem } from "store/slices/modalSlice";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";

const { Option } = Select;

const scheduleStatusList = ["All", "Scheduled", "Ongoing", "Expired"];

const EventsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { filteredEvents, message, loading } = useSelector(
    (state) => state.event
  );

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

  const handleUpdateStatus = (item) => {
    const newStatus = !item.status;
    const data = { status: newStatus, id: item.id };

    dispatch(setSelectedItem(data));
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
      title: "Max Tickets",
      dataIndex: "max_tickets",
      sorter: (a, b) => utils.antdTableSorter(a, b, "max_tickets"),
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

  const handleSearch = (e) => {
    dispatch(filterEvent({ searchTerm: e.target.value, status: null }));
  };

  const handleShowStatus = (status) => {
    dispatch(filterEvent({ searchTerm: null, status }));
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
              onChange={handleShowStatus}
              className="mr-2"
            >
              <Option value="All">All</Option>
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
            onClick={() => navigate(`${APP_PREFIX_PATH}/event/add`)}
          >
            Add Event
          </Button>
        </div>
      </Flex>
      <div className="table-responsive">
        <Table
         columns={tableColumns}
         dataSource={filteredEvents}
         rowKey="id"
         loading={loading}
         pagination={{ pageSize: 10 }}
         
       
        />
      </div>

      <UpdateStatusModal
        responseMessage={message}
        editFunction={editEvent}
        getAllFunction={fetchAllEvent}
      />
    </Card>
  );
};

export default EventsList;
