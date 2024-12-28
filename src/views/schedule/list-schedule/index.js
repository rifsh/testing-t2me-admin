import React, { useEffect } from "react";
import { Badge, Button, Card, Input, Select, Table, Tag } from "antd";
import Flex from "components/shared-components/Flex";
import { FormOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { useDispatch, useSelector } from "react-redux";
import {
  editSchedule,
  fetchAllSchedules,
  filterSchedules,
} from "store/slices/scheduleSlice";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
import { setSelectedItem } from "store/slices/modalSlice";
import Utils from "utils";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";

const { Option } = Select;

const ScheduleList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { filteredSchedules, message,pagination, editable_status, loading } = useSelector(
    (state) => state.schedules
  );
  // const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchAllSchedules(DEFAULT_PAGE_SIZE));
  }, [dispatch]);

  const handlePagination = (page, size) => {
    dispatch(fetchAllSchedules({ page: page, size: size }));
  };
  const handleUpdateStatus = (item) => {
    const newStatus = !item.status;
    const data = { status: newStatus, id: item.id };
    dispatch(setSelectedItem(data));
  };

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
      dataIndex: "is_scheduled",
      render: (_, record) => {
        let statusText;
        let badgeStatus;

        if (record.is_scheduled && record.status) {
          statusText = "Running";
          badgeStatus = "success";
        } else if (!record.is_scheduled && record.status) {
          statusText = "Upcoming";
          badgeStatus = "warning";
        } else {
          statusText = "Expired";
          badgeStatus = "error";
        }

        return (
          <div>
            <Badge status={badgeStatus}></Badge>
            <span className="mx-2">{statusText}</span>
          </div>
        );
      },
      sorter: (a, b) =>
        a.is_scheduled === b.is_scheduled ? 0 : a.is_scheduled ? -1 : 1,
      sortDirections: ["ascend", "descend"],
    },
  ];

  return (
    <Card>
      <Flex alignItems="center" justifyContent="space-between">
        <SearchBarWithStatus fetchFunction={fetchAllSchedules} />
        <Button
          type="primary"
          icon={<FormOutlined />}
          onClick={() => navigate(`${APP_PREFIX_PATH}/schedule/add`)}
        >
          Add Schedule
        </Button>
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
        responseMessage={message}
        editable_status={editable_status}
        editFunction={editSchedule}
        getAllFunction={fetchAllSchedules}
      />
    </Card>
  );
};

export default ScheduleList;
