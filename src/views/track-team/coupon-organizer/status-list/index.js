/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Card, Table, Select, Menu, Row, Form, Tag } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import Flex from "components/shared-components/Flex";
import { useLocation, useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { useDispatch, useSelector } from "react-redux";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import Utils from "utils";
import { fetchAllCoupons, fetchAllTrackCoupons } from "store/slices/couponSlice";

const { Option } = Select;

const OrganizerOfferStatusList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const type = params.get("type");
  const { filteredCoupons, pagination, loading } = useSelector(
    (state) => state.coupons
  );
  const [activeStatus, setactiveStatus] = useState();

  useEffect(() => {
    dispatch(
      fetchAllTrackCoupons({
        ...DEFAULT_PAGE_SIZE,
        event_code: Utils.getEventTypeCodeWithType(type),
      })
    );
  }, [dispatch]);

  const handlePagination = (page, size) => {
    dispatch(
      fetchAllCoupons({
        page: page,
        size: size,
        isOrganizer: true,
        event_code: Utils.getEventTypeCodeWithType(type),
      })
    );
  };

  const handleViewDetails = async (id) => {
    console.log(id);
    navigate(`${APP_PREFIX_PATH}/track/coupon/status/details/${id}`);
  };

  const handleShowStatus = (status) => {
    setactiveStatus(status);
    dispatch(
      fetchAllCoupons({
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
      title: "Offer Name",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Theaters",
      dataIndex: "theatre_ids",
      render: (theatreIds) => {
        return theatreIds ? `${theatreIds.length} theaters selected` : "None";
      },
    },
    {
      title: "Status",
      dataIndex: "approval_status",
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
          <Tag color={color}>{mappedText[text?.toLowerCase()] || text}</Tag>
        );
      },
      sorter: (a, b) => a.approval_status.localeCompare(b.approval_status),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "",
      dataIndex: "actions",
      render: (_, elm) => (
        <div className="text-right">
          <EllipsisDropdown menu={dropdownMenu(elm)} />
        </div>
      ),
    },
  ];

  const [form] = Form.useForm();

  return (
    <Card>
      <Row gutter={16} justify="start" align="" wrap={false}>
        <SearchBarWithStatus
          fetchFunction={fetchAllCoupons}
          isOrganizer={true}
          isStatus={false}
          additionalParams={{
            event_code: Utils.getEventTypeCodeWithType(type),
          }}
        />

        <div className="mb-3">
          <Select
            defaultValue="All"
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
          dataSource={filteredCoupons}
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
    </Card>
  );
};

export default OrganizerOfferStatusList;
