import React, { useEffect } from "react";
import { Card, Table, Select, Input, Button, Tag, Menu, Spin } from "antd";
import {
  EyeOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  FormOutlined,
} from "@ant-design/icons";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import Flex from "components/shared-components/Flex";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOffers, filterOffers } from "store/slices/offerSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";

const { Option } = Select;

const getStatusColor = (status) => (status ? "green" : "red");

const OfferList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { filteredOffers, loading } = useSelector((state) => state.offers);

  useEffect(() => {
    dispatch(fetchAllOffers());
  }, [dispatch]);

  const handleSearch = (e) => {
    const searchTerm = e.target.value.trim();
    dispatch(filterOffers({ searchTerm, status: null }));
  };

  const handleShowStatus = (status) => {
    const statusFilter = status === "All" ? null : status === "Active";
    dispatch(filterOffers({ searchTerm: null, status: statusFilter }));
  };

  const dropdownMenu = (row) => (
    <Menu>
      <Menu.Item key="view">
        <Flex alignItems="center">
          <EyeOutlined />
          <span className="ml-2">View Details</span>
        </Flex>
      </Menu.Item>
      <Menu.Item key="add-remark">
        <Flex alignItems="center">
          <PlusCircleOutlined />
          <span className="ml-2">Add to Remark</span>
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
      title: "Discount Percentage",
      dataIndex: "discount_percentage",
      sorter: (a, b) => a.discount_percentage - b.discount_percentage,
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      render: (start_date) => (start_date ? start_date : "N/A"),
      sorter: (a, b) =>
        new Date(a.start_date || "1970-01-01") -
        new Date(b.start_date || "1970-01-01"),
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      render: (end_date) => (end_date ? end_date : "N/A"),
      sorter: (a, b) =>
        new Date(a.end_date || "1970-01-01") -
        new Date(b.end_date || "1970-01-01"),
    },
    {
      title: "Max Users",
      dataIndex: "max_uses",
      sorter: (a, b) => a.max_uses - b.max_uses,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (_, row) => <EllipsisDropdown menu={dropdownMenu(row)} />,
    },
  ];

  return (
    <Card>
      <Flex alignItems="center" justifyContent="space-between" className="mb-3">
        <Flex>
          <Input
            placeholder="Search"
            prefix={<SearchOutlined />}
            onChange={handleSearch}
            className="mr-2"
            allowClear
          />
          <Select
            defaultValue="All"
            onChange={handleShowStatus}
            className="mr-2"
            style={{ width: 120 }}
          >
            <Option value="All">All</Option>
            <Option value="Active">Active</Option>
            <Option value="Inactive">Inactive</Option>
          </Select>
        </Flex>
        <Button
          type="primary"
          icon={<FormOutlined />}
          onClick={() => navigate(`${APP_PREFIX_PATH}/offer/add`)}
        >
          Add Offer
        </Button>
      </Flex>
      <Spin spinning={loading}>
        <Table
          columns={tableColumns}
          dataSource={filteredOffers}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>
    </Card>
  );
};

export default OfferList;
