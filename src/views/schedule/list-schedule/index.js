import React, { useEffect } from "react";
import { Button, Card, Input, Select, Table } from "antd";
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

const { Option } = Select;

const ScheduleList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { filteredSchedules, message } = useSelector(
    (state) => state.schedules
  );
  // const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchAllSchedules());
  }, [dispatch]);

  const handleSearch = (e) => {
    dispatch(filterSchedules({ searchTerm: e.target.value }));
  };

  const handleShowStatus = (status) => {
    dispatch(filterSchedules({ status }));
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
      sorter: (a, b) => a.event.localeCompare(b.event),
    },
    {
      title: "Event",
      dataIndex: ["event", "event_name"],
      sorter: (a, b) => Utils.antdTableSorter(a, b, ["event", "event_name"]),
    },
    {
      title: "Start Time",
      dataIndex: "start_date",
      sorter: (a, b) => a.startTime.localeCompare(b.startTime),
    },
    {
      title: "End Time",
      dataIndex: "end_date",
      sorter: (a, b) => a.endTime.localeCompare(b.endTime),
    },
    Utils.statusColumnUtil(handleUpdateStatus),
  ];

  return (
    <Card>
      <Flex alignItems="center" justifyContent="space-between">
        <Flex className="mb-1">
          <div className="mr-md-3 mb-3">
            <Input
              placeholder="Search"
              prefix={<SearchOutlined />}
              onChange={handleSearch}
            />
          </div>
          <div className="mr-md-3 mb-3">
            <Select
              defaultValue="All"
              placeholder="Status"
              style={{ minWidth: 180 }}
              onChange={handleShowStatus}
            >
              <Option value="All">All</Option>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </div>
        </Flex>
        <Button
          type="primary"
          icon={<FormOutlined />}
          onClick={() => navigate(`${APP_PREFIX_PATH}/schedule/add`)}
        >
          Add Schedule
        </Button>
      </Flex>
      <div>
        <Table columns={tableColumns} dataSource={filteredSchedules} />
      </div>

      <UpdateStatusModal
        responseMessage={message}
        editFunction={editSchedule}
        getAllFunction={fetchAllSchedules}
      />
    </Card>
  );
};

export default ScheduleList;
