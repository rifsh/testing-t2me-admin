/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Card, Table, Select, Menu, Row, Form, Tag } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import Flex from "components/shared-components/Flex";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { useDispatch, useSelector } from "react-redux";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import { fetchAllOffers } from "store/slices/offerSlice";
import Utils from "utils";
import usePaginationHook from "utils/hooks/usePaginationHandler";

const { Option } = Select;

const OrganizerOfferStatusList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { type } = useParams(); 
  const { filteredOffers, pagination, loading } = useSelector(
    (state) => state.offers
  );
  const [activeStatus, setactiveStatus] = useState();
  const handlePagination = usePaginationHook(fetchAllOffers);

  useEffect(() => {
    dispatch(
      fetchAllOffers({
        ...DEFAULT_PAGE_SIZE,
        organizer: true,
        isOrganizer: true,
        event_code: Utils.getEventTypeCodeWithType(type),
      })
    );
  }, [dispatch]);

  // const handlePagination = (page, size) => {
  //   dispatch(
  //     fetchAllOffers({
  //       page: page,
  //       size: size,
  //       isOrganizer: true,
  //       event_code: Utils.getEventTypeCodeWithType(type),
  //     })
  //   );
  // };

  const handleViewDetails = async (id) => {
    console.log(id);
    navigate(`${APP_PREFIX_PATH}/track/offer/status/details/${id}/${type}`);
  };

  const handleShowStatus = (status) => {
    setactiveStatus(status);
    dispatch(
      fetchAllOffers({
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
          fetchFunction={fetchAllOffers}
          isStatus={false}
          isOrganizer={true}
          additionalParams={{
            event_code: Utils.getEventTypeCodeWithType(type)
          }}
          additionalFilters={[]}
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
          dataSource={filteredOffers}
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
