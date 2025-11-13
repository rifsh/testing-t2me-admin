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
import { TextConstants } from "constants/TextConstant";
import usePaginationHook from "utils/hooks/usePaginationHandler";
import { resetSearchValue, setGlobalSearchValue } from "store/slices/fliterSlice";
import usePermissions from "utils/hooks/usePermissions";
import { PERMISSIONS } from "constants/RolesPermissionConstants";

const { Option } = Select;

const IssueList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pagination, editable_status, issues, message, loading } =
    useSelector((state) => state.issue);
  const [searchTerm, setSearchTerm] = useState();
  const [activeStatus, setactiveStatus] = useState();
  const [userFilter, setUserFilter] = useState();
  const CurrentUser = getCurrentUser();
  const handlePagination = usePaginationHook(fetchAllissues);
  const { hasPermission, hasAnyPermission } = usePermissions();

  useEffect(() => {
    dispatch(fetchAllissues({ ...DEFAULT_PAGE_SIZE }));
  }, [dispatch]);

  const handleViewDetails = async (id) => {
    await dispatch(fetchIssueDetails(id));
    navigate(`${APP_PREFIX_PATH}/issue/details/${id}`);
  };


  const handleSearch = (value) => {
    console.log('Search value:', value);

    // Always update the search term state
    setSearchTerm(value);

    if (value) {
      dispatch(setGlobalSearchValue(value));
      dispatch(
        fetchAllissues({
          search: value, // Make sure this matches your API parameter name
          page: 1,
          size: 10,
          active: activeStatus,
          role_id: userFilter,
        })
      );
    } else {
      // Handle empty search
      handleClearSearch();
    }
  };

  const handleSearchIsEmpty = (e) => {
    const value = e.target.value;
    setSearchTerm(value); // Always update the local state

    // Use debounce or timeout to avoid too many API calls
    if (value === '') {
      handleClearSearch();
    }
  };

  const handleClearSearch = () => {
    dispatch(resetSearchValue());
    setSearchTerm('');
    dispatch(
      fetchAllissues({
        page: 1,
        size: 10,
        active: activeStatus,
        role_id: userFilter,
        search: null, // or empty string depending on your API
      })
    );
  };

  const handleShowStatus = (status) => {
    setactiveStatus(status);
    dispatch(
      fetchAllissues({
        search: searchTerm,
        page: 1,
        size: 10,
        filter: status,
        role_id: userFilter,
      })
    );
  };

  const handleUserFilterStatus = (value) => {
    setUserFilter(value);
    dispatch(
      fetchAllissues({
        search: searchTerm,
        page: 1,
        size: 10,
        filter: activeStatus,
        role_id: value,
      })
    );
  };

  const getRowStyle = (record) => {
    const isAssignedToMe = record.ticket_assigned?.id === CurrentUser.id;
    const isDone = record?.issue_status === TextConstants.Done;

    let style = {
      // cursor: 'pointer',
      transition: 'all 0.3s ease'
    };

    if (isAssignedToMe) {
      style.backgroundColor = isDone ? '#f6ffed' : '#f6ffed';
      style.opacity = 1;
    } else {
      style.opacity = 0.8;
    }

    return style;
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
      render: (text, record) => (
        <span style={{
          fontWeight: record.ticket_assigned?.id === CurrentUser.id ? '500' : 'normal'
        }}>
          {text}
        </span>
      ),
    },
    {
      title: "Issue",
      dataIndex: "issue",
      sorter: (a, b) => {
        const issueA = a.issue || "";
        const issueB = b.issue || "";
        return issueA.localeCompare(issueB);
      },
    },
    {
      title: "From",
      dataIndex: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Assigned To",
      dataIndex: ["ticket_assigned", "email"],
      render: (text, record) => {
        const isAssignedToMe = record.ticket_assigned?.id === CurrentUser.id;
        return (
          <span style={{
            color: isAssignedToMe ? '#52c41a' : 'inherit',
            fontWeight: isAssignedToMe ? '500' : 'normal'
          }}>
            {text || 'Unassigned'}
          </span>
        );
      },
      sorter: (a, b) => {
        const assignedA = a.ticket_assigned?.email;
        const assignedB = b.ticket_assigned?.email;
        return (assignedA || '').localeCompare(assignedB || '');
      },
    },
    {
      title: "Status",
      dataIndex: "issue_status",
      render: (text) => {
        const status = text?.toLowerCase();
        let color = 'default';
        let statusText = text;

        if (status === TextConstants.Done) {
          color = 'success';
        } else if (status === TextConstants.Pending) {
          color = 'warning';
        } else if (status === 'in progress') {
          color = 'processing';
        }

        return (
          <Tag
            color={color}
            style={{
              color: '#000000',  // Force black text
              fontWeight: '400'  // Normal font weight
            }}
          >
            {statusText?.charAt(0).toUpperCase() + statusText?.slice(1) || 'Unknown'}
          </Tag>
        );
      },
      sorter: (a, b) => {
        const statusA = a.issue_status || "";
        const statusB = b.issue_status || "";
        return statusA.localeCompare(statusB);
      },
    },
    {
      title: "Ticket Status",
      dataIndex: "ticket_status",
      render: (ticket_status) => (
        <Tag
          color={ticket_status ? "success" : "error"}
          style={{
            color: '#000000',  // Force black text
            fontWeight: '400'  // Normal font weight
          }}
        >
          {ticket_status ? "Closed" : "Open"}
        </Tag>
      ),
      sorter: (a, b) => {
        const statusA = a.ticket_status === true ? "closed" : "open";
        const statusB = b.ticket_status === true ? "closed" : "open";
        return statusA.localeCompare(statusB);
      },
    },
    {
      title: "",
      dataIndex: "actions",
      render: (_, elm) => (
        hasPermission(PERMISSIONS.APPLICATIONS.ISSUES.ISSUE.GET_ISSUE_DETAILS) ? (
          <div className="text-right" style={{ color: '#000000' }}>
            <EllipsisDropdown
              menu={dropdownMenu(elm)}
              menuStyle={{ color: '#000000' }}
            />
          </div>
        ) : null
      ),
    },
  ];

  const { Search } = Input;

  const handleClearFilters = () => {
    setSearchTerm(null);
    setactiveStatus(null);
    setUserFilter(null);

    dispatch(resetSearchValue());
    dispatch(
      fetchAllissues({
        ...DEFAULT_PAGE_SIZE,
        search: null,
        filter: null,
        role_id: null,
      })
    );
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
            <Search
              placeholder="Search Issues"
              onChange={handleSearchIsEmpty} // Use the modified handler
              onSearch={handleSearch}
              style={{ width: 200 }}
              value={searchTerm}
            />
          </div>
          <div className="mb-3">
            <Select
              defaultValue="All"
              onChange={handleShowStatus}
              className="mr-2"
              value={activeStatus}
              style={{ width: 150 }}
            >
              <Option value={null}>All</Option>
              <Option value={true}>Closed</Option>
              <Option value={false}>Open</Option>
            </Select>
          </div>
          {CurrentUser.role_id !== UserRoleConstants.eventOrganizerRoleId && (
            <div className="mb-3">
              <Select
                defaultValue="All"
                onChange={handleUserFilterStatus}
                className="mr-2"
                style={{ width: 150 }}
                value={userFilter}
              >
                <Option value={null}>All</Option>
                <Option value={TextConstants.CurrentUser}>Assigned to me</Option>
                {(CurrentUser.role_id === UserRoleConstants.superAdminRoleId ||
                  CurrentUser.role_id === UserRoleConstants.techAdminRoleId) && (
                    <>
                      <Option value={UserRoleConstants.techAdminRoleId}>
                        Tech Admin
                      </Option>
                      <Option value={UserRoleConstants.techSupportingTeamRoleId}>
                        Super Supporting Team
                      </Option>
                      <Option value={UserRoleConstants.eventSupportingTeamRoleId}>
                        Event Supporting Team
                      </Option>
                    </>
                  )}
              </Select>
            </div>
          )}
          <div className="mb-3">
            <Button onClick={handleClearFilters}>Clear</Button>
          </div>
        </Flex>
        {hasPermission(PERMISSIONS.APPLICATIONS.ISSUES.ISSUE.ADD_ISSUES) && CurrentUser?.role_id !== 1 && (
          <div>
            <Button
              type="primary"
              icon={<FormOutlined />}
              block
              onClick={() => navigate(`${APP_PREFIX_PATH}/issue/add`)}
            >
              Add Issue
            </Button>
          </div>
        )}
      </Flex>
      <div className="table-responsive">
        <Table
          columns={tableColumns}
          dataSource={issues}
          rowKey="id"
          loading={loading}
          onRow={(record) => ({
            style: getRowStyle(record),
            // onClick: () => handleViewDetails(record.id)
          })}
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