import React, { useEffect, useState } from "react";
import { Card, Table, Select, Input, Button, Menu, Tag, Alert, Col } from "antd";
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
import { fetchAllissues, fetchIssueDetails, fetchAllAlertissues } from "store/slices/IssueSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import Flex from "components/shared-components/Flex";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import utils from "utils";
import { setDialogVisible, setSelectedItem } from "store/slices/modalSlice";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import { getCurrentUser, getUserRole } from "configs/UserAccessConfig";
import { UserRoleConstants } from "constants/UserRoleConstant";
import { TextConstants } from "constants/TextConstant";
import usePaginationHook from "utils/hooks/usePaginationHandler";
import usePermissions from "utils/hooks/usePermissions";
import { PERMISSIONS } from "constants/RolesPermissionConstants";

const { Option } = Select;

const scheduleStatusList = ["All", "Scheduled", "Ongoing", "Expired"];

const IssueList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions()
  const { pagination, editable_status, issues, message, loading } =
    useSelector((state) => state.issue);
  useEffect(() => {
    console.warn('tholi..........', getCurrentUser().role_id)
    dispatch(fetchAllAlertissues({ ...DEFAULT_PAGE_SIZE }));
  }, [dispatch]);
  const handlePagination = usePaginationHook(fetchAllAlertissues);

  const handleViewDetails = async (id) => {
    console.warn(id)
    await dispatch(fetchIssueDetails(id));
    navigate(`${APP_PREFIX_PATH}/alerts/details/${id}`);
  };

  // const handleEditEvent = async (id) => {
  //   navigate(`${APP_PREFIX_PATH}/event/edit/${id}`);
  // };

  // const handleUpdateStatus = (item) => {
  //   const newStatus = !item.status;
  //   const data = { status: newStatus, id: item.id };

  //   dispatch(setSelectedItem(data));
  // };

  // const handlePagination = (page, size) => {
  //   dispatch(fetchAllAlertissues({ page: page, size: size }));
  // };
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
      sorter: (a, b) =>
        (a, b) => a.issue.localeCompare(b.issue),
    },
    {
      title: "from",
      dataIndex: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "assigned_to",
      dataIndex: ["ticket_assigned", "email"], // Fallback index
      render: (text, record) => {
        // If assigned_role is null, display ticket_assigned.email, otherwise display assigned_role.email
        return record.re_assigned_to
          ? record.re_assigned_to?.email
          : record.ticket_assigned?.email || "N/A";
      },
      sorter: (a, b) => {
        const assignedA = a.re_assigned_to
          ? a.re_assigned_to.email
          : a.ticket_assigned?.email || "";
        const assignedB = b.re_assigned_to
          ? b.re_assigned_to.email
          : b.ticket_assigned?.email || "";
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
      sorter: (a, b) =>
        a.issue_status.localeCompare(b.issue_status), // Sort alphabetically by status
      sortDirections: ["ascend", "descend"],
    }
    ,
    {
      title: "Created On",
      dataIndex: "created_at",
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      render: (created_at) => {
        if (!created_at) {
          return <div style={{ color: "#888" }}>No date available</div>;
        }

        const date = new Date(created_at);
        if (isNaN(date)) {
          return <div style={{ color: "#888" }}>Invalid date</div>;
        }

        const formattedDate = date.toISOString().split("T")[0]; // Extract only the date part
        const daysAgo = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24)); // Calculate days ago

        return (
          <>
            <div>{formattedDate}</div>
            <div style={{ color: "#888" }}>{daysAgo} days ago</div>
          </>
        );
      },
    }


    ,
    {
      title: "",
      dataIndex: "actions",
      render: (_, elm) => (
        hasPermission(PERMISSIONS.APPLICATIONS.ISSUES.ISSUE_ALERT.GET_ISSUE_ALERTS) ? (
          <div className="text-right">
            <EllipsisDropdown
              menu={dropdownMenu(elm)}
            />
          </div>
        ) : null
      ),
    },
  ];
  const [searchTerm, setSearchTerm] = useState();
  const [activeStatus, setactiveStatus] = useState();
  const handleSearch = (value) => {
    if (value) {
      setSearchTerm(value);
      dispatch(
        fetchAllAlertissues({
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
        fetchAllAlertissues({ search: null, page: 1, size: 10, active: activeStatus })
      );
    }
  };

  const handleShowStatus = (value) => {
    setactiveStatus(value);
    dispatch(
      fetchAllAlertissues({
        search: searchTerm,
        page: 1,
        size: 10,
        role_id: value,
      })
    );
  };
  const { Search } = Input;
  return (
    <>
      <Col xs={24} sm={24} md={17} className="mb-4">
        <Alert
          message="Warning"
          description={TextConstants.IssuesContent}
          type="warning"
          showIcon
        />
      </Col>
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
            <div className="mb-3 w-60">
              <Select
                defaultValue="All"
                onChange={handleShowStatus}
                className="mr-2 w-full"
              >
                <Option value={null}>All</Option>
                <Option value={TextConstants.CurrentUser}>Assigned to me</Option>
                <Option value={UserRoleConstants.techAdminRoleId}>
                  Tech Admin
                </Option>
                <Option value={UserRoleConstants.techSupportingTeamRoleId}>
                  Tech Supporting Team
                </Option>
                <Option value={UserRoleConstants.eventSupportingTeamRoleId}>
                  Event Supporting Team
                </Option>

              </Select>
            </div>
          </Flex>
          {getCurrentUser().role_id == UserRoleConstants.eventOrganizerRoleId && <div>
            <Button
              type="primary"
              icon={<FormOutlined />}
              block
              onClick={() => navigate(`${APP_PREFIX_PATH}/issue/add`)}
            >
              Add Issue
            </Button>
          </div>}
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
    </>
  );
};

export default IssueList;
