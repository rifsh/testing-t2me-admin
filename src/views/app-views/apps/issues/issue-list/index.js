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
    // console.warn( getCurrentUser().role_id)
    dispatch(fetchAllissues({...DEFAULT_PAGE_SIZE}));
  }, [dispatch]);

  const handleViewDetails = async (id) => {
    // console.warn(id)
    await dispatch(fetchIssueDetails(id));
    navigate(`${APP_PREFIX_PATH}/issue/details/${id}`);
  };

  // const handleEditEvent = async (id) => {
  //   navigate(`${APP_PREFIX_PATH}/event/edit/${id}`);
  // };

  // const handleUpdateStatus = (item) => {
  //   const newStatus = !item.status;
  //   const data = { status: newStatus, id: item.id };

  //   dispatch(setSelectedItem(data));
  // };

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
      sorter: (a, b) => a.ticket_id.localeCompare(b.ticket_id),
    },
    {
      title: "Issue Title",
      dataIndex: "subject",
      sorter: (a, b) => a.subject.localeCompare(b.subject),
    },
    {
      title: "Issue",
      dataIndex: "issue",
      sorter: (a, b) => {
        const issueA = a.issue || ""; // Fallback to empty string if null/undefined
        const issueB = b.issue || "";
        return issueA.localeCompare(issueB);
      },
    },
    
    {
      title: "from",
      dataIndex: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "assigned to",
      dataIndex: ["ticket_assigned", "email"], // Fallback index
      // render: (text, record) => {

      //      record.ticket_assigned?.email 
      // },
      sorter: (a, b) => {
        const assignedA = a.ticket_assigned?.email 
        const assignedB = b.ticket_assigned?.email 
        return assignedA.localeCompare(assignedB);
      },
    },
    {
      title: "Status",
      dataIndex: "issue_status",
      render: (text) => (
        <Tag color={text.toLowerCase() === "done" ? "green" : "red"}>
          {text.charAt(0).toUpperCase() + text.slice(1)}
        </Tag>
      ),
      sorter: (a, b) => {
        const statusA = a.issue_status || ""; // Fallback to empty string if null/undefined
        const statusB = b.issue_status || "";
        return statusA.localeCompare(statusB);
      },
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Closed",
      dataIndex: "ticket_status",
      sorter: (a, b) => {
        // Ensure comparison values are always defined and normalized
        const statusA = a.ticket_status === true ? "closed" : "open";
        const statusB = b.ticket_status === true ? "closed" : "open";
        return statusA.localeCompare(statusB);
      },
      render: (ticket_status) =>
        ticket_status ? (
          <span style={{ color: "green" }}>✔️</span>
        ) : (
          <span style={{ color: "red" }}>❌</span>
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
        fetchAllissues({
          search: value,
          page: 1,
          size: 10,
          active: activeStatus,
          // role_id:getCurrentUser().role_id
        })
      );
    }
  };
  const handleSearchIsEmpty = (value) => {
    console.log("enterd is empty search");
    if (!value) {
      console.log("is empty search");

      dispatch(
        fetchAllissues({ search: null, page: 1, size: 10, active: activeStatus })
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
          rowClassName={(record) =>
            record.ticket_assigned?.id !== getCurrentUser().id ? { opacity: 0.6 }: {opacity: 0.6 }
          }
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
