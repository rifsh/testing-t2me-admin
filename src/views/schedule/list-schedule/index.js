import React, { useState } from "react";
import { Button, Card, Input, Select, Table } from "antd";
import Flex from "components/shared-components/Flex";
import { FormOutlined, SearchOutlined } from "@ant-design/icons";
import utils from "utils";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";

const { Option } = Select;

const scheduleDataList = [
  {
    key: "1", // Added unique key for table rows
    event: "Meeting with Team",
    startTime: "2024-11-21T10:00:00",
    endTime: "2024-11-21T11:00:00",
    status: "Active",
  },
  {
    key: "2",
    event: "Project Presentation",
    startTime: "2024-11-21T14:00:00",
    endTime: "2024-11-21T15:30:00",
    status: "Inactive",
  },
];

const ScheduleList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [list, setList] = useState(scheduleDataList);

  const navigate = useNavigate();

  // Filter list by status
  const handleShowStatus = (value) => {
    const filteredData =
      value !== "All"
        ? scheduleDataList.filter((item) => item.status === value)
        : scheduleDataList;
    setList(filteredData);
  };

  // Filter list by search term
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filteredData = scheduleDataList.filter(
      (item) =>
        item.event.toLowerCase().includes(value) ||
        item.status.toLowerCase().includes(value)
    );
    setList(filteredData);
  };

  const tableColumns = [
    {
      title: "Event",
      dataIndex: "event",
      sorter: (a, b) => a.event.localeCompare(b.event),
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
      sorter: (a, b) => a.startTime.localeCompare(b.startTime),
    },
    {
      title: "End Time",
      dataIndex: "endTime",
      sorter: (a, b) => a.endTime.localeCompare(b.endTime),
    },
    {
      title: "Status",
      dataIndex: "status",
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
  ];

  return (
    <Card>
      <Flex alignItems="center" justifyContent="space-between">
        <Flex className="mb-1">
          <div className="mr-md-3 mb-3">
            <Input
              placeholder="Search"
              prefix={<SearchOutlined />}
              value={searchTerm}
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
        <Table columns={tableColumns} dataSource={list} />
      </div>
    </Card>
  );
};

export default ScheduleList;
