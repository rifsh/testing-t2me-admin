import React, { useEffect, useState } from "react";
import { Card, Table, Select, Input, Button, Menu, Tag } from "antd";
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
import { fetchAllissues, fetchIssueDetails } from "store/slices/IssueSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import Flex from "components/shared-components/Flex";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import utils from "utils";
import { setDialogVisible, setSelectedItem } from "store/slices/modalSlice";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import { getCurrentUser, getUserRole } from "configs/UserAccessConfig";
import { UserRoleConstants } from "constants/UserRoleConstant";

const { Option } = Select;

const scheduleStatusList = ["All", "Scheduled", "Ongoing", "Expired"];

const IssueList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pagination, editable_status, issues, message, loading } =
    useSelector((state) => state.issue);
  useEffect(() => {
    console.warn('tholi..........', getCurrentUser().role_id)
    dispatch(fetchAllissues({...DEFAULT_PAGE_SIZE,'role_id':getCurrentUser().role_id}));
  }, [dispatch]);

  const handleViewDetails = async (id) => {
    console.warn(id)
    await dispatch(fetchIssueDetails(id));
    navigate(`${APP_PREFIX_PATH}/issue/details/${id}`);
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
    dispatch(fetchAllissues({ page: page, size: size }));
  };
  const dropdownMenu = (row) => (
    <Menu>
      <Menu.Item>
        <Flex alignItems="center" onClick={() => handleViewDetails(row.id)}>
          <EyeOutlined />
          <span className="ml-2">View Details</span>
        </Flex>
      </Menu.Item>
    </Menu>
  );

  const tableColumns = [
    {
      title: "Issue Id",
      dataIndex: "ticket_id",
      sorter: (a, b) => utils.antdTableSorter(a, b, "ticket_id"),
    },
    {
      title: "Issue Title",
      dataIndex: "subject",
      sorter: (a, b) => utils.antdTableObjectSorter(a, b, "subject"),
    },
    {
      title: "Issue",
      dataIndex: "issue",
      sorter: (a, b) =>
        utils.antdTableObjectSorter(a, b, "issue"),
    },
    {
      title: "from",
      dataIndex: "email",
      sorter: (a, b) => utils.antdTableObjectSorter(a, b, "email"),
    },
    {
      title: "Status",
      dataIndex: "issue_status",
      render: (text) => (
        <Tag color={text.toLowerCase() === "done" ? "green" : "red"}>
          {text.charAt(0).toUpperCase() + text.slice(1)}
        </Tag>
      ),
      sorter: (a, b) =>
        a.issue_status.localeCompare(b.issue_status), // Sort alphabetically by status
      sortDirections: ["ascend", "descend"],
    }
,    
    {
      title: "Closed",
      dataIndex: "ticket_status",
      sorter: (a, b) => utils.antdTableSorter(a, b, "ticket_status"),
      render: (ticket_status) => (
        ticket_status ? (
          <span style={{ color: "green" }}>✔️</span> 
        ) : (
          <span style={{ color: "red" }}>❌</span> 
        )
      ),
    },
    
    {
      title: "",
      dataIndex: "actions",
      render: (_, elm) => (
        <div className="text-right">
          <EllipsisDropdown 
          menu={dropdownMenu(elm)}
           />
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
              placeholder="Search Issues"
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
        { getCurrentUser().role_id == UserRoleConstants.eventOrganizerRoleId &&<div>
          <Button
            type="primary"
            icon={<FormOutlined />}
            block
            onClick={() => navigate(`${APP_PREFIX_PATH}/issue/add`)}
          >
            Add Issue
          </Button>
        </div> }
      </Flex>
      <div className="table-responsive">
        <Table
          columns={tableColumns}
          dataSource={issues}
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
        getAllFunction={(pageData) => fetchAllEvent(pageData)}
        pageData={{ page: 1, size: 10 }}
      />
    </Card>
  );
};

export default IssueList;
