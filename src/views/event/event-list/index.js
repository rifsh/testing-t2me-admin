import React, { useEffect, useState } from "react";
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
  const { pagination, editable_status, filteredEvents, message, loading } =
    useSelector((state) => state.event);

  useEffect(() => {
    dispatch(fetchAllEvent({ page: 1, size: 10 }));
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

  const handlePagination = (page, size) => {
    dispatch(fetchAllEvent({ page: page, size: size }));
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
          pagination={{
            current: pagination.page,
            pageSize: pagination.size,
            total: pagination.total,
            onChange: (page, pageSize) => handlePagination(page, pageSize),
          }}
        />
      </div>

      <UpdateStatusModal
        responseMessage={message}
        editFunction={editEvent}
        editable_status={editable_status}
        getAllFunction={fetchAllEvent}
        //  getAllFunction= (pageData) => fetchCategories(pageData)
        //         pageData={ page: 1, size: 10 }
      />
    </Card>
  );
};

export default EventsList;
