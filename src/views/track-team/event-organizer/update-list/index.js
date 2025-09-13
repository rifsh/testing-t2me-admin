/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  Table,
  Select,
  Menu,
  Row, Dropdown,
  Form,
  Tag,
  Button
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
} from "@ant-design/icons";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import Flex from "components/shared-components/Flex";
import dayjs from "dayjs";
import { DATE_FORMAT_DD_MM_YYYY } from "constants/DateConstant";
import utils from "utils";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { useDispatch, useSelector } from "react-redux";
import {
  editPlace,
  getPlaces,
  getSinglePlace,
} from "store/slices/locationSlice";
import {
  fetchOrganizerUpdates,
  fetchSingleOrganizerUpdate,
} from "store/slices/EventOrganizerSlice";
import { setDialogVisible, setSelectedItem } from "store/slices/modalSlice";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import UserForm from "views/user/form-user";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import usePermissions from "utils/hooks/usePermissions";
import { PERMISSIONS } from "constants/RolesPermissionConstants";

const { Option } = Select;

const EventOrganiseUpdateList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    filteredOrganizerUpdates,
    editable_status,
    message,
    loading,
    pagination,
    searchTerm,
  } = useSelector((state) => state.organizerUpdates);
  const [activeStatus, setactiveStatus] = useState();
  const { hasPermission, hasAnyPermission } = usePermissions();
  const searchBarRef = useRef();

  useEffect(() => {
    // dispatch(fetchOrgUpdates());
    dispatch(fetchOrganizerUpdates(DEFAULT_PAGE_SIZE));
  }, [dispatch]);

  const handlePagination = (page, size) => {
    dispatch(fetchOrganizerUpdates({ page: page, size: size }));
  };
  const handleViewDetails = async (id) => {
    console.log(id);
    navigate(`${APP_PREFIX_PATH}/track-team/event-organizer/details/${id}`);
  };

  const handleShowStatus = (status) => {
    setactiveStatus(status);
    dispatch(
      fetchOrganizerUpdates({
        page: 1,
        size: 10,
        filters: status,
      })
    );
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
      title: "Organiser Name",
      dataIndex: ["organizer", "username"],
      sorter: (a, b) => a.organizer?.username - b.organizer?.username

    },

    {
      title: "Event",
      dataIndex: ["events", "event_name"],
      sorter: (a, b) => a.events?.event_name - a.events?.event_name
    },
    {
      title: "Status",
      dataIndex: "approval_status",
      render: (text) => {
        const mappedText = {
          'pending': 'Pending Approval',
          'rejected': 'Rejected',
          'approved': 'Approved',
          'update': 'Change Requested'
        };

        const color =
          text.toLowerCase() === "approved"
            ? "green"
            : text.toLowerCase() === "rejected"
              ? "red"
              : text.toLowerCase() === "update"
                ? "blue"
                : "orange";

        return (
          <Tag color={color}>
            {mappedText[text.toLowerCase()] || text}
          </Tag>
        );
      },
      sorter: (a, b) =>
        a.approval_status.localeCompare(b.approval_status),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "",
      dataIndex: "actions",
      render: (_, elm) => (
        hasPermission(PERMISSIONS.APPLICATIONS.TRACK_REQUEST.EVENT.GET_SINGLE_EVENT_UPDATE) ? (
          <div className="text-right">
            <EllipsisDropdown menu={dropdownMenu(elm)} />
          </div>
        ) : null
      ),
    },
  ];

  const [form] = Form.useForm();



  return (
    <Card>
      <Row gutter={16} justify="start" align="" wrap={false}>
        <SearchBarWithStatus
          ref={searchBarRef}
          fetchFunction={fetchOrganizerUpdates}
          isStatus={false}
          clearBtnVisibility={false}
        />

        <div className="mb-3">
          <Select
            defaultValue="All"
            onChange={handleShowStatus}
            className="mr-2 wide-select w-32"
            value={activeStatus}
          >
            <Option value={null}>All</Option>
            <Option value="REJECTED">Rejected</Option>
            <Option value="PENDING">Pending</Option>
            <Option value="APPROVED">Approved</Option>
            <Option value="UPDATES">Update Requested</Option>
          </Select>
        </div>
        <div className="mb-3">
          <Button onClick={() => {
            searchBarRef.current.clearAllFilters();
            setactiveStatus(null)
          }
          }>
            Clear
          </Button>
        </div>
      </Row>


      <div className="table-responsive">
        <Table
          columns={tableColumns}
          dataSource={filteredOrganizerUpdates}//{orgUpdates}//{filteredPlaces}
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
        editFunction={editPlace}
        getAllFunction={(pageData) => getPlaces(pageData)}
        pageData={{ page: 1, size: 10 }}
        editable_status={editable_status}
      />
    </Card>
  );
};

export default EventOrganiseUpdateList;
