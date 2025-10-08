import React, { useEffect } from "react";
import { Badge, Button, Card, Menu, message, Modal, Table } from "antd";
import Flex from "components/shared-components/Flex";
import { EditOutlined, EyeOutlined, FormOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { useDispatch, useSelector } from "react-redux";
import {
  checkScheduleEdit,
  editSchedule,
  editScheduleStatus,
  fetchAllSchedules,
  fetchSingleSchedules,
} from "store/slices/scheduleSlice";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
import { setDialogVisible, setSelectedItem } from "store/slices/modalSlice";
import Utils from "utils";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import usePaginationHook from "utils/hooks/usePaginationHandler";
import usePermissions from "utils/hooks/usePermissions";
import { PERMISSIONS } from "constants/RolesPermissionConstants";

const ScheduleList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    filteredSchedules,
    checkedscheduleDetails,
    message: scheduleMessage,
    pagination,
    editable_status,
    loading,
  } = useSelector((state) => state.schedules);
  // const [form] = Form.useForm();
  const { hasPermission, hasAnyPermission } = usePermissions();
  useEffect(() => {
    dispatch(fetchAllSchedules(DEFAULT_PAGE_SIZE));
  }, [dispatch]);
  const handlePagination = usePaginationHook(fetchAllSchedules);

  // const handlePagination = (page, size) => {
  //   dispatch(fetchAllSchedules({ page: page, size: size }));
  // };
  const handleUpdateStatus = (item) => {
    const newStatus = !item.status;
    const data = { status: newStatus, schedule_id: Number(item.id) };
    console.log(item);
    dispatch(setDialogVisible(true));
    dispatch(setSelectedItem(data));
  };
  const handleViewDetails = async (id) => {
    // await dispatch(fetchSingleSchedules({ id: id }));
    navigate(`${APP_PREFIX_PATH}/schedule/${id}`);
  };
  const handleEditSchedule = async (id) => {
    try {
      const result = await dispatch(
        checkScheduleEdit({ schedule_id: id })
      ).unwrap();

      if (result?.editable === true) {
        navigate(`${APP_PREFIX_PATH}/schedule/edit/${id}`);
      } else {
        Modal.error({
          content:
            "Sorry, this event already has bookings in all time slots. You cannot edit this schedule.",
        });
      }
    } catch (error) {
      console.error("Error checking schedule edit:", error);
      Modal.error({
        content: "Something went wrong while checking the schedule.",
      });
    }
  };

  const dropdownMenu = (row) => (
    <Menu>
      {hasPermission(
        PERMISSIONS.APPLICATIONS.SERVICES.EVENT.SCHEDULE
          .GET_EVENT_SCHEDULE_DETAILS
      ) && (
          <Menu.Item>
            <Flex alignItems="center" onClick={() => handleViewDetails(row.id)}>
              <EyeOutlined />
              <span className="ml-2">View Details</span>
            </Flex>
          </Menu.Item>
        )}
      <Menu.Item>
        <Flex alignItems="center" onClick={() => handleEditSchedule(row.id)}>
          <EditOutlined />
          <span className="ml-2">Edit Event</span>
        </Flex>
      </Menu.Item>
    </Menu>
  );
  const tableColumns = [
    {
      title: "Schedule Name",
      dataIndex: "name",
      sorter: (a, b) => Utils.antdTableSorter(a, b, "name"),
    },
    {
      title: "Event",
      dataIndex: ["event", "event_name"],
      sorter: (a, b) =>
        Utils.antdTableObjectSorter(a, b, ["event", "event_name"]),
    },
    {
      title: "Start Time",
      dataIndex: "start_date",
      sorter: (a, b) => Utils.antdTableSorter(a, b, "start_date"),
    },
    {
      title: "End Time",
      dataIndex: "end_date",
      sorter: (a, b) => Utils.antdTableSorter(a, b, "end_date"),
    },
    Utils.statusColumnUtil(handleUpdateStatus),
    {
      title: "Is Scheduled",
      dataIndex: "schedule_status",
      render: (_, record) => {
        const statusMap = {
          "Event Expired": { text: "Event Expired", badge: "error" },
          "Event Upcoming": { text: "Event Upcoming", badge: "processing" },
          "Event Running": { text: "Event Running", badge: "success" },
          "Event Disabled": { text: "Event Disabled", badge: "error" },
          "Event Booking Enabled": {
            text: "Event Booking Enabled",
            badge: "success",
          },
          "Event Ad running": { text: "Event Ad running", badge: "warning" },
        };

        const status = statusMap[record.schedule_status] || {
          text: record.schedule_status,
          badge: "default",
        };

        return (
          <div>
            <Badge status={status.badge} />
            <span className="mx-2">{status.text}</span>
          </div>
        );
      },
      sorter: (a, b) => Utils.antdTableSorter(a, b, "schedule_status"),
    },
    {
      title: "",
      dataIndex: "actions",
      render: (_, elm) =>
        hasAnyPermission([
          PERMISSIONS.APPLICATIONS.SERVICES.EVENT.SCHEDULE
            .GET_EVENT_SCHEDULE_DETAILS,
        ]) ? (
          <div className="text-right">
            <EllipsisDropdown menu={dropdownMenu(elm)} />
          </div>
        ) : null,
    },
  ];

  return (
    <Card>
      <Flex alignItems="center" justifyContent="space-between">
        <SearchBarWithStatus fetchFunction={fetchAllSchedules} />
        {hasPermission(
          PERMISSIONS.APPLICATIONS.SERVICES.EVENT.SCHEDULE.ADD_EVENT_SCHEDULES
        ) && (
            <Button
              type="primary"
              icon={<FormOutlined />}
              onClick={() => navigate(`${APP_PREFIX_PATH}/schedule/new/add`)}
            >
              Add Schedule (New)
            </Button>
          )}
        {hasPermission(
          PERMISSIONS.APPLICATIONS.SERVICES.EVENT.SCHEDULE.ADD_EVENT_SCHEDULES
        ) && (
            <Button
              type="primary"
              icon={<FormOutlined />}
              onClick={() => navigate(`${APP_PREFIX_PATH}/schedule/add`)}
            >
              Add Schedule
            </Button>
          )}
      </Flex>
      <div>
        <Table
          columns={tableColumns}
          dataSource={filteredSchedules}
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
        responseMessage={scheduleMessage}
        editable_status={editable_status}
        editFunction={editScheduleStatus}
        getAllFunction={(pageData) => fetchAllSchedules(pageData)}
        pageData={{ page: 1, size: 10 }}
      />
    </Card>
  );
};

export default ScheduleList;
