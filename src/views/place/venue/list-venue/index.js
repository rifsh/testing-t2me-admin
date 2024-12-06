import React, { useEffect } from "react";
import { Card, Table, Select, Input, Button, Tag, Menu, Row, Col } from "antd";
import {
  EyeOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  FormOutlined,
} from "@ant-design/icons";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import Flex from "components/shared-components/Flex";
import { useDispatch, useSelector } from "react-redux";
import { Form } from "antd";
import { useNavigate } from "react-router-dom";

import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import utils from "utils";
import { filterVenues, getVenues } from "store/slices/locationSlice";

const { Option } = Select;

const getStatusColor = (status) => (status ? "green" : "red");

const VenueList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { filteredVenues, loading } = useSelector((state) => state.locations);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(getVenues());
  }, [dispatch]);

  const handleSearch = (e) => {
    dispatch(filterVenues({ searchTerm: e.target.value }));
  };

  const handleShowStatus = (status) => {
    dispatch(filterVenues({ status }));
  };

  const handleSelectPlace = async (id) => {
    console.log("Selected Place ID:", id);
    dispatch(getVenues(id));
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
      title: "Venue",
      dataIndex: "name",
      render: (name) => <span>{name || "N/A"}</span>,
      sorter: (a, b) => utils.antdTableSorter(a, b, "name"),
    },
    {
      title: "Address",
      dataIndex: "address",
      render: (address) => <span>{address || "N/A"}</span>,
      sorter: (a, b) => utils.antdTableSorter(a, b, "address"),
    },
    {
      title: "Is Indoor",
      dataIndex: "indoor",
      render: (indoor) => <span>{indoor ? "Yes" : "No"}</span>,
      sorter: (a, b) => utils.antdTableSorter(a, b, "indoor"),
    },
    {
      title: "Capacity",
      dataIndex: "capacity",
      render: (capacity) => <span>{capacity || "0"}</span>,
      sorter: (a, b) => utils.antdTableSorter(a, b, "capacity"),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status ? "Active" : "Inactive"}
        </Tag>
      ),
      sorter: (a, b) => utils.antdTableSorter(a, b, "status"),
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

  return (
    <Card>
      <Row gutter={16} justify={"space-between"} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <PlaceWithCountryForm
            form={form}
            onSelect={(id) => handleSelectPlace(id)}
          />
        </Col>
        <Col xs={24} sm={8} style={{ textAlign: 'right' }}>
          <Button
            type="primary"
            icon={<FormOutlined />}
            onClick={() => navigate(`${APP_PREFIX_PATH}/venue/add`)}
          >
            Add Venue
          </Button>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12}>
          <Input
            placeholder="Search"
            prefix={<SearchOutlined />}
            onChange={handleSearch}
            style={{ width: '100%' }}
          />
        </Col>
        <Col xs={24} sm={12}>
          <Select
            defaultValue="All"
            onChange={handleShowStatus}
            placeholder="Status"
            style={{ width: '100%' }}
          >
            <Option value="All">All status</Option>
            <Option value={true}>Active</Option>
            <Option value={false}>Inactive</Option>
          </Select>
        </Col>
      </Row>

      <div className="table-responsive">
        <Table
          columns={tableColumns}
          dataSource={filteredVenues}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>
    </Card>
  );
};

export default VenueList;