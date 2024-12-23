import React, { useCallback } from "react";
import { Card, Select, Input, Button, Menu } from "antd";
import {
  EyeOutlined,
  SearchOutlined,
  FormOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchAllEvent,
  filterEvent,
  setCurrentPage,
  setPageSize,
  editEvent,
} from "store/slices/eventSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import Flex from "components/shared-components/Flex";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import utils from "utils";
import CommonPaginationTable from "components/shared-components/Table/CommonPaginationTable";
import { usePagination } from "utils/hooks/usePagination";
import { debounce } from "lodash";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";

const { Option } = Select;

const EventsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { filteredEvents, pagination, loading, message } = useSelector(
    (state) => state.event
  );

  const { page, size } = pagination || {};

  const { handlePageChange, handlePageSizeChange } = usePagination({
    fetchAction: fetchAllEvent,
    setCurrentPageAction: setCurrentPage,
    setPageSizeAction: setPageSize,
    currentPage: page || 1,
    pageSize: size || 10,
    extraParams: {}
  });

  const handleViewDetails = (id) =>
    navigate(`${APP_PREFIX_PATH}/event/details/${id}`);

  const handleEditEvent = (id) =>
    navigate(`${APP_PREFIX_PATH}/event/edit/${id}`);

  const handleUpdateStatus = (item) => {
    const newStatus = !item.status;
    const data = { status: newStatus, id: item.id };
    dispatch(editEvent({ data }));
  };

  const dropdownMenu = (row) => (
    <Menu>
      <Menu.Item onClick={() => handleViewDetails(row.id)}>
        <EyeOutlined />
        <span className="ml-2">View Details</span>
      </Menu.Item>
      <Menu.Item onClick={() => handleEditEvent(row.id)}>
        <EditOutlined />
        <span className="ml-2">Edit Event</span>
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
      render: (_, elm) => <EllipsisDropdown menu={dropdownMenu(elm)} />,
    },
  ];

  const debouncedSearch = useCallback(
    debounce((value) => {
      dispatch(filterEvent({ searchTerm: value, status: null }));
    }, 300),
    [dispatch]
  );

  const handleSearchChange = (e) => debouncedSearch(e.target.value);

  const handleShowStatus = (status) => {
    dispatch(filterEvent({ searchTerm: null, status }));
    if (page !== 1) {
      dispatch(setCurrentPage(1));
    }
  };

  return (
    <Card>
      <Flex alignItems="center" justifyContent="space-between" mobileFlex={false}>
        <Flex className="mb-1" mobileFlex={false}>
          <Input
            placeholder="Search"
            prefix={<SearchOutlined />}
            onChange={handleSearchChange}
            className="mr-md-3 mb-3"
          />
          <Select
            defaultValue="All"
            onChange={handleShowStatus}
            className="mb-3 mr-2"
          >
            <Option value="All">All</Option>
            <Option value="Active">Active</Option>
            <Option value="Inactive">Inactive</Option>
          </Select>
        </Flex>
        <Button
          type="primary"
          icon={<FormOutlined />}
          onClick={() => navigate(`${APP_PREFIX_PATH}/event/add`)}
        >
          Add Event
        </Button>
      </Flex>
      <CommonPaginationTable
        columns={tableColumns}
        dataSource={filteredEvents}
        loading={loading}
        total={pagination?.total || 0}
        currentPage={page || 1}
        pageSize={size || 10}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
      <UpdateStatusModal
        responseMessage={message}
        editFunction={editEvent}
        getAllFunction={fetchAllEvent}
      />
    </Card>
  );
};

export default EventsList;
