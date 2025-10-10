import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Select,
  Input,
  Button,
  Menu,
  message,
  Collapse,
  Tooltip,
  Space,
  Modal,
} from "antd";
import {
  EyeOutlined,
  FormOutlined,
  EditOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  editEvent,
  fetchAllEvent,
  fetchEventDetails,
  setModalLoading,
  setDialogVisible,
  setEditItemId,
  editEventStatus,
  checkEventEditAvailability,
} from "store/slices/eventSlice";
import { setDialogVisible as setStatusDialogVisible } from "store/slices/modalSlice";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import Flex from "components/shared-components/Flex";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import utils from "utils";
import { setSelectedItem } from "store/slices/modalSlice";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
import { DEFAULT_PAGE_SIZE, EVENT_TYPES } from "constants/PageConstants";
import { getCurrentUser } from "configs/UserAccessConfig";
import { UserRoleConstants } from "constants/UserRoleConstant";
import { TextConstants } from "constants/TextConstant";
import StatusSubmitAndConfirmModal from "components/util-components/ModalItems/StatusSubmitModal";
import usePaginationHook from "utils/hooks/usePaginationHandler";
import {
  resetSearchValue,
  setGlobalSearchValue,
} from "store/slices/fliterSlice";
import { PERMISSIONS, ROLES } from "constants/RolesPermissionConstants";
import usePermissions from "utils/hooks/usePermissions";
import AddOnsModal from "views/qr-scanner/components/Modal";
import { setScannerType } from "store/slices/qrVerificationSlice";
import { SCANNER_TYPES } from "constants/QrConstants";
import { checkScheduleEdit } from "store/slices/scheduleSlice";
const { Panel } = Collapse;

const { Option } = Select;

const scheduleStatusList = ["All", "Scheduled", "Ongoing", "Expired"];

const EventsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const {
    pagination,
    editable_status,
    filteredEvents,
    messages,
    loading,
    dialogVisible,
    modalLoading,
    warningPagination,
    editItemId,
    responseImpactData,
  } = useSelector((state) => state.event);
  console.log(pagination, "pag");

  const { responseData } = useSelector((state) => state.modalSlice);
  const eventParams = {
    size: DEFAULT_PAGE_SIZE.size,
    page: DEFAULT_PAGE_SIZE.page,
    event_type: EVENT_TYPES.event,
  };
  const handlePagination = usePaginationHook(fetchAllEvent);
  const { hasPermission, hasAnyPermission } = usePermissions();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    dispatch(fetchAllEvent(eventParams));
  }, [dispatch]);

  const handleViewDetails = async (id) => {
    await dispatch(fetchEventDetails(id));
    navigate(`${APP_PREFIX_PATH}/event/details/${id}`);
  };

  const handleEditEvent = async (id) => {
    console.log("TRYING TO EDIT ");
    console.log(UserRoleConstants.eventOrganizerRoleId, "ORGANIZER ID");
    console.log(currentUser.role_id, "CURRENT USER  ID");

    if (currentUser.role_id === UserRoleConstants.eventOrganizerRoleId) {
      const hasPendingUpdates = filteredEvents
        .find((event) => event.id === id)
        ?.updates?.some(
          (update) =>
            update.approval_status === "pending" ||
            update.approval_status === "updates"
        );

      if (hasPendingUpdates) {
        message.warning("This Event have already pending edit approval");
        return;
      }
    }
    dispatch(setEditItemId(id));
    try {
      const result = await dispatch(
        checkEventEditAvailability({ event_id: id })
      ).unwrap();

      if (result?.editable === true) {
        navigate(`${APP_PREFIX_PATH}/schedule/edit/${id}`);
      } else {
        Modal.error({
          content:
            "Sorry, this event already has bookings in all time slots. You cannot edit this event.",
        });
      }
    } catch (error) {
      console.error("Error checking schedule edit:", error);
      Modal.error({
        content: "Something went wrong while checking the schedule.",
      });
    }
  };

  const handleUpdateStatus = (item) => {
    const newStatus = !item.status;
    const data = { status: newStatus, id: item.id };

    dispatch(setSelectedItem(data));
    dispatch(setStatusDialogVisible(true));
  };

  const handleVerifyEvent = (data) => {
    dispatch(setScannerType(SCANNER_TYPES.event));
    // navigate(`${APP_PREFIX_PATH}/qr-scanner/${SCANNER_TYPES.event}`);
    navigate(
      `${APP_PREFIX_PATH}/qr-scanner/${SCANNER_TYPES.event}/${data?.id}`
    );
  };

  const handleVerifyAddon = (data) => {
    console.log("Verify Addon for Event:", data);
    showAddonModal(data);
  };

  const showAddonModal = (event) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  const handleModalSubmit = async () => {
    dispatch(setModalLoading(true));
    navigate(`${APP_PREFIX_PATH}/event/edit/${editItemId}`);
    dispatch(setDialogVisible(false));
    dispatch(setModalLoading(false));
  };

  const handleModalCancel = () => {
    dispatch(setDialogVisible(false));
  };
  const dropdownMenu = (row) => (
    <Menu>
      {hasPermission(
        PERMISSIONS.APPLICATIONS.SERVICES.EVENT.EVENT.GET_EVENT_DETAIL
      ) && (
        <Menu.Item>
          <Flex alignItems="center" onClick={() => handleViewDetails(row.id)}>
            <EyeOutlined />
            <span className="ml-2">View Details</span>
          </Flex>
        </Menu.Item>
      )}
      {hasPermission(
        PERMISSIONS.APPLICATIONS.SERVICES.EVENT.EVENT.EDIT_EVENT
      ) && (
        <Menu.Item>
          <Flex alignItems="center" onClick={() => handleEditEvent(row.id)}>
            <EditOutlined />
            <span className="ml-2">Edit Event</span>
          </Flex>
        </Menu.Item>
      )}
      {/* {hasPermission(PERMISSIONS.APPLICATIONS.SERVICES.EVENT.EVENT.EDIT_EVENT) && <Menu.Item>
        <Flex alignItems="center" onClick={() => {
          navigate(`${APP_PREFIX_PATH}/qr-scanner`);
        }}>
          <EditOutlined />
          <span className="ml-2">QR code</span>
        </Flex>
      </Menu.Item>} */}
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
      dataIndex: "venues",
      render: (_, record) => (
        <Collapse defaultActiveKey={[]} accordion>
          {record?.venues && record.venues.length > 0 ? (
            record.venues.map((venue, index) => (
              <Panel header={venue.name} key={index}>
                <ul style={{ paddingLeft: 20 }}>
                  <li style={{ padding: "10px 0" }}>
                    <div>
                      <span style={{ fontWeight: "bold" }}>Place: </span>
                      <span style={{ color: "lightblue", fontWeight: "bold" }}>
                        {venue.place.name}
                      </span>
                    </div>
                  </li>
                </ul>
              </Panel>
            ))
          ) : (
            <Panel collapsible="disabled" header={"No venue available"} />
          )}
        </Collapse>
      ),
    },

    utils.statusColumnUtil(
      handleUpdateStatus,
      !hasPermission(
        PERMISSIONS.APPLICATIONS.SERVICES.EVENT.EVENT.EDIT_EVENT_STATUS
      )
    ),

    {
      title: "",
      dataIndex: "qrHandler",
      width: 200,
      align: "center",
      render: (_, elm) => (
        <Space size={"small"} className="text-right">
          {/* Verify Event Button */}
          {currentUser?.role_id === ROLES.EVENT_ORGANIZER &&
            elm?.jsonb_add_ons?.length > 0 && (
              <>
                <Tooltip title="Verify Event">
                  <Button
                    type="primary"
                    size="small"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleVerifyEvent(elm)}
                    style={{
                      borderRadius: "6px",
                      background: "#52c41a",
                      borderColor: "#52c41a",
                    }}
                  >
                    Verify
                  </Button>
                </Tooltip>

                <Tooltip title="Verify Addon">
                  <Button
                    size="small"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleVerifyAddon(elm)}
                    style={{ borderRadius: "6px" }}
                  >
                    Verify Addon
                  </Button>
                </Tooltip>
              </>
            )}
        </Space>
      ),
    },
    {
      title: "",
      dataIndex: "actions",
      render: (_, elm) => (
        <div className="text-right">
          {hasAnyPermission([
            PERMISSIONS.APPLICATIONS.SERVICES.EVENT.EVENT.EDIT_EVENT,
            PERMISSIONS.APPLICATIONS.SERVICES.EVENT.EVENT.GET_EVENT_DETAIL,
          ]) && <EllipsisDropdown menu={dropdownMenu(elm)} />}
        </div>
      ),
    },
  ];

  const [searchTerm, setSearchTerm] = useState();
  const [activeStatus, setactiveStatus] = useState();
  const handleSearch = (value) => {
    if (value) {
      setSearchTerm(value);
      dispatch(setGlobalSearchValue(value));
      dispatch(
        fetchAllEvent({
          search: value,
          page: 1,
          size: 10,
          active: activeStatus,
          event_type: EVENT_TYPES.event,
        })
      );
    }
  };
  const handleSearchIsEmpty = (value) => {
    console.log("enterd is empty search");
    if (value) {
      dispatch(setGlobalSearchValue(value));
      setSearchTerm(value);
    }
    if (!value) {
      console.log("is empty search");
      dispatch(resetSearchValue());
      dispatch(
        fetchAllEvent({
          search: null,
          page: 1,
          size: 10,
          active: activeStatus,
          event_type: EVENT_TYPES.event,
        })
      );
    }
  };

  const handleShowStatus = (status) => {
    setactiveStatus(status);
    dispatch(
      fetchAllEvent({
        search: searchTerm,
        page: 1,
        size: 10,
        active: status,
        event_type: EVENT_TYPES.event,
      })
    );
    // dispatch(filterEvent({ searchTerm: null, status }));
  };
  const { Search } = Input;

  const handleClearFilters = () => {
    setSearchTerm(null);
    setactiveStatus(null);

    dispatch(resetSearchValue());
    dispatch(
      fetchAllEvent({
        search: null,
        page: DEFAULT_PAGE_SIZE.page,
        size: DEFAULT_PAGE_SIZE.size,
        event_type: EVENT_TYPES.event,
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
              placeholder="Search Event"
              onChange={(e) => handleSearchIsEmpty(e.target.value)}
              onSearch={(value) => handleSearch(value)}
              style={{ width: 200 }}
              value={searchTerm}
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
          <div className="mb-3">
            <Button onClick={handleClearFilters}>Clear</Button>
          </div>
        </Flex>
        <div>
          {hasPermission(
            PERMISSIONS.APPLICATIONS.SERVICES.EVENT.EVENT.ADD_EVENT
          ) && (
            <Button
              type="primary"
              icon={<FormOutlined />}
              block
              onClick={() => navigate(`${APP_PREFIX_PATH}/event/add`)}
            >
              Add Event
            </Button>
          )}
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
            onChange: (page, pageSize) =>
              handlePagination(page, pageSize, EVENT_TYPES.event),
          }}
        />
      </div>
      <WarningModal
        mode={"itemmodal"}
        visible={dialogVisible}
        title="Edit Event"
        details={TextConstants.DefaultEditContent1}
        warningMessage="Do you want to proceed to the edit page?"
        onSubmit={handleModalSubmit}
        onCancel={handleModalCancel}
        confirmText="Proceed to Edit"
        cancelText="Cancel"
        loading={modalLoading}
      />

      <UpdateStatusModal
        responseMessage={messages}
        editFunction={editEventStatus}
        editable_status={editable_status}
        getAllFunction={(pageData) => fetchAllEvent(pageData)}
        responseData={responseImpactData}
        tableConfig={{
          title: "Active Schedules",
          dataKey: "items",
        }}
        pageData={{ page: 1, size: 10 }}
        pagination={warningPagination}
        loading={loading}
      />
      <StatusSubmitAndConfirmModal
        editFunction={editEventStatus}
        getAllFunction={fetchAllEvent}
        responseData={responseData}
        responseMessage={messages}
        pageData={DEFAULT_PAGE_SIZE}
        onSubmitMessage={TextConstants.StatusUpdatedSuccess}
        onCloseMessage={TextConstants.StatusUpdateCanceled}
      />
      <style jsx global>{`
        .table-row-light {
          background-color: #ffffff !important;
        }
        .table-row-dark {
          background-color: #fafafa !important;
        }
        .ant-table-thead > tr > th {
          background: #f8f9fa !important;
          border-bottom: 2px solid #e8e8e8 !important;
          font-weight: 600 !important;
          color: #262626 !important;
          padding: 16px 24px !important;
        }
        .ant-table-tbody > tr > td {
          padding: 16px 24px !important;
          border-bottom: 1px solid #f0f0f0 !important;
        }
        .ant-table-tbody > tr:hover > td {
          background: #f0f9ff !important;
        }
        .ant-collapse-ghost > .ant-collapse-item {
          border-bottom: none !important;
        }
        .ant-collapse-ghost > .ant-collapse-item > .ant-collapse-header {
          padding: 8px 12px !important;
        }
        .ant-collapse-ghost
          > .ant-collapse-item
          > .ant-collapse-content
          > .ant-collapse-content-box {
          padding: 8px 12px !important;
        }
      `}</style>

      <AddOnsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        eventData={selectedEvent}
      />
    </Card>
  );
};

export default EventsList;
