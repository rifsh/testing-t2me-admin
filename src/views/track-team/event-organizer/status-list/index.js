/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Card, Table, Select, Menu, Row, Form, Tag, Tooltip } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import Flex from "components/shared-components/Flex";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { useDispatch, useSelector } from "react-redux";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import Utils from "utils";
import usePaginationHook from "utils/hooks/usePaginationHandler";
import { fetchAllEvent } from "store/slices/eventSlice";

const { Option } = Select;

const OrganizerOfferStatusList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { type } = useParams();

  const { filteredEvents = [], pagination, loading = false } = useSelector(
    (state) => state.event || {}
  );

  const [activeStatus, setactiveStatus] = useState(null);
  const handlePagination = usePaginationHook(fetchAllEvent);

  useEffect(() => {
    dispatch(
      fetchAllEvent({
        ...DEFAULT_PAGE_SIZE,
        organizer: true,
        isOrganizer: true,
        event_code: Utils.getEventTypeCodeWithType(type),
      })
    );
  }, [dispatch, type]);

  const handleViewDetails = async (id) => {
    console.log(id);
    navigate(`${APP_PREFIX_PATH}/track/event/status/details/${id}`);
  };

  const handleShowStatus = (status) => {
    setactiveStatus(status);
    dispatch(
      fetchAllEvent({
        page: 1,
        size: 10,
        filters: status,
        isOrganizer: true,
        event_code: Utils.getEventTypeCodeWithType(type),
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
      title: "Event Name",
      dataIndex: "event_name",
      key: "event_name",
      sorter: (a, b) => (a.event_name || "").localeCompare(b.event_name || ""),
      width: 200,
    },
    {
      title: "Category",
      dataIndex: ["category", "name"],
      key: "category",
      render: (text) => text || "—",
    },
    {
      title: "Sub Category",
      dataIndex: ["sub_category", "name"],
      key: "sub_category",
      render: (text) => text || "—",
    },
    {
      title: "Venues",
      dataIndex: "venues",
      key: "venues",
      render: (venues) => {
        if (!venues || venues.length === 0) return "None";
        return (
          <Tooltip title={venues.map((v) => v.name).join(", ")}>
            <span>{venues.length} venue(s)</span>
          </Tooltip>
        );
      },
    },
    {
      title: "Schedules",
      dataIndex: "schedules",
      key: "schedules",
      render: (schedules) => {
        if (!schedules || schedules.length === 0) return "None";
        return (
          <Tooltip
            title={schedules.map((s) => `${s.name}: ${s.start_date} to ${s.end_date}`).join("\n")}
          >
            <span>{schedules.length} schedule(s)</span>
          </Tooltip>
        );
      },
    },
    {
      title: "Event Type",
      dataIndex: ["event_type", "display_name"],
      key: "event_type",
      render: (text) => text || "—",
    },
    {
      title: "Status",
      dataIndex: "approval_status",
      key: "approval_status",
      render: (text) => {
        const mappedText = {
          pending: "Pending Approval",
          rejected: "Rejected",
          approved: "Approved",
          update: "Change Requested",
        };

        const color =
          text?.toLowerCase() === "approved"
            ? "green"
            : text?.toLowerCase() === "rejected"
            ? "red"
            : text?.toLowerCase() === "update"
            ? "blue"
            : "orange";

        return (
          <Tag color={color}>{mappedText[text?.toLowerCase()] || text || "—"}</Tag>
        );
      },
      sorter: (a, b) =>
        (a.approval_status || "").localeCompare(b.approval_status || ""),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      width: 80,
      render: (_, elm) => (
        <div className="text-right">
          <EllipsisDropdown menu={dropdownMenu(elm)} />
        </div>
      ),
    },
  ];

  return (
    <Card>
      <Row gutter={16} justify="start" align="middle" wrap={false}>
        <SearchBarWithStatus
          fetchFunction={fetchAllEvent}
          isStatus={false}
          isOrganizer={true}
          additionalParams={{
            event_code: Utils.getEventTypeCodeWithType(type),
          }}
          additionalFilters={[]}
        />

        <div className="mb-3">
          <Select
            value={activeStatus || "All"}
            onChange={handleShowStatus}
            className="mr-2 wide-select"
          >
            <Option value={null}>All</Option>
            <Option value="REJECTED">Rejected</Option>
            <Option value="PENDING">Pending</Option>
            <Option value="APPROVED">Approved</Option>
            <Option value="UPDATES">Update Requested</Option>
          </Select>
        </div>
      </Row>

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
            onChange: (page, pageSize) => handlePagination(page, pageSize),
          }}
          scroll={{ x: 1200 }}
        />
      </div>
    </Card>
  );
};

export default OrganizerOfferStatusList;