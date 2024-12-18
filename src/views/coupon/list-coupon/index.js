/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import { Card, Table, Select, Input, Button, Tag, Menu } from "antd";
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
import { editCoupon, fetchAllCoupons, filterCoupons } from "store/slices/couponSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import Utils from "utils";
import { setSelectedItem } from "store/slices/statusModalSlice";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
const { Option } = Select;

const getStatusColor = (status) => {
  if (status) {
    return "green"; // Active
  }
  return "red"; // Inactive
};

const OfferList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { filteredCoupons, loading , message} = useSelector((state) => state.coupons);

  useEffect(() => {
    dispatch(fetchAllCoupons());
  }, [dispatch]);

  const handleSearch = (value) => {
    dispatch(filterCoupons({ searchTerm: value, status: null }));
  };
  const handleUpdateStatus = (item) => {
    const newStatus = !item.status;
    const data = { status: newStatus, id: item.id };

    dispatch(setSelectedItem(data));
  };
  const handleShowStatus = (status) => {
    dispatch(filterCoupons({ searchTerm: null, status }));
  };

  const dropdownMenu = (row) => (
    <Menu>
      <Menu.Item>
        <Flex alignItems="center">
          <EyeOutlined />
          <span className="ml-2">View Details</span>
        </Flex>
      </Menu.Item>
      <Menu.Item>
        <Flex alignItems="center">
          <PlusCircleOutlined />
          <span className="ml-2">Add to remark</span>
        </Flex>
      </Menu.Item>
    </Menu>
  );

  const tableColumns = [
    {
      title: "Coupon Name",
      dataIndex: "name",
      render: (_, record) => <span>{record.name}</span>,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Coupon Code",
      dataIndex: "coupon_code",
      render: (_, record) => <span>{record.coupon_code}</span>,
      sorter: (a, b) => a.coupon_code.localeCompare(b.coupon_code),
    },
    {
      title: "Discount (%)",
      dataIndex: "discount_percentage",
      render: (_, record) => <span>{record.discount_percentage}</span>,
      sorter: (a, b) => a.discount_percentage - b.discount_percentage,
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      render: (_, record) => <span>{record.start_date}</span>,
      sorter: (a, b) => new Date(a.start_date) - new Date(b.start_date),
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      render: (_, record) => <span>{record.end_date}</span>,
      sorter: (a, b) => new Date(a.end_date) - new Date(b.end_date),
    },
    {
      title: "Max Uses",
      dataIndex: "max_uses",
      render: (_, record) => <span>{record.max_uses}</span>,
      sorter: (a, b) => a.max_uses - b.max_uses,
    },
    Utils.statusColumnUtil(handleUpdateStatus),
    {
      title: "",
      dataIndex: "actions",
      render: (_, record) => (
        <div className="text-right">
          <EllipsisDropdown menu={dropdownMenu(record)} />
        </div>
      ),
    },
  ];

  return (
    <Card>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        mobileFlex={false}
      >
        <Flex className="mb-1" mobileFlex={false}>
          <div className="mr-md-3 mb-3">
            <Input
              placeholder="Search"
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <Select
              defaultValue="All"
              className="w-100"
              style={{ minWidth: 180 }}
              onChange={handleShowStatus}
              placeholder="Status"
            >
              <Option value="All">All Offers</Option>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </div>
        </Flex>
        <div>
          <Button
            type="primary"
            icon={<FormOutlined />}
            block
            onClick={() => navigate(`${APP_PREFIX_PATH}/coupon/add`)}
          >
            Add Coupon
          </Button>
        </div>
      </Flex>
      <div className="table-responsive">
        <Table
          columns={tableColumns}
          dataSource={filteredCoupons}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>
      <UpdateStatusModal
        responseMessage={message}
        editFunction={editCoupon}
        getAllFunction={fetchAllCoupons}
      />
    </Card>
  );
};

export default OfferList;
