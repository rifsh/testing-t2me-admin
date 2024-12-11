/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import {
  Card,
  Table,
  Select,
  Input,
  Button,
  Menu,
  Tag,
  Row,
  Col,
  Form,
} from "antd";
import {
  EyeOutlined,
  FormOutlined,
  SearchOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import Flex from "components/shared-components/Flex";
import dayjs from "dayjs";
import { DATE_FORMAT_DD_MM_YYYY } from "constants/DateConstant";
import utils from "utils";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { useDispatch, useSelector } from "react-redux";
import {
  filterPlaces,
  getCoutryDetails,
  getPlaces,
} from "store/slices/locationSlice";

const { Option } = Select;

const getStatusColor = (status) => (status ? "green" : "red");

const PlaceList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { filteredPlaces, detailedCountryList, loading } = useSelector(
    (state) => state.locations
  );

  useEffect(() => {
    dispatch(getPlaces());
    dispatch(getCoutryDetails());
  }, [dispatch]);

  const handleSearch = (value) => {
    dispatch(filterPlaces({ searchTerm: value, status: null }));
  };
  const handleSelectCountry = async (id) => {
    dispatch(getPlaces(id));
  };
  const handleShowStatus = (status) => {
    dispatch(
      filterPlaces({
        searchTerm: null,
        status: status === "All" ? null : status === "Active",
      })
    );
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
      title: "Place Name",
      dataIndex: "name",
      sorter: (a, b) => utils.antdTableSorter(a, b, "name"),
    },
    {
      title: "Country ID",
      dataIndex: "country_id",
      sorter: (a, b) => utils.antdTableSorter(a, b, "country_id"),
    },
    {
      title: "Created Date",
      dataIndex: "created_at",
      render: (createdDate) => (
        <span>{dayjs(createdDate).format(DATE_FORMAT_DD_MM_YYYY)}</span>
      ),
      sorter: (a, b) => utils.antdTableSorter(a, b, "created_at"),
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
      title: "Action",
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
      <Row gutter={16} justify="space-between" >
        <Col xs={24} sm={8}>
          <Form.Item name="country_id">
            <Select
              className="w-100"
              placeholder="Choose a Country"
              loading={loading}
              onSelect={(id) => handleSelectCountry(id)}
            >
              {detailedCountryList.map((country) => {
                return (
                  <Option key={country.id} value={country.id}>
                    {country.name}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={8} style={{ textAlign: "right" }}>
          <Button
            type="primary"
            icon={<FormOutlined />}
            onClick={() => navigate(`${APP_PREFIX_PATH}/place/add`)}
          >
            Add Place
          </Button>
        </Col>
      </Row>
      <Row
        alignItems="center"
        justifyContent="space-between"
        mobileFlex={false}
        className="mb-3"
      >
        <Input
          placeholder="Search"
          prefix={<SearchOutlined />}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ marginRight: 8 , width:"50%"}}
        />
        <Select
          defaultValue="All"
          className="w-100"
          style={{ width:40}}
          onChange={handleShowStatus}
          placeholder="Status"
        >
          <Option value="All">All</Option>
          <Option value="Active">Active</Option>
          <Option value="Inactive">Inactive</Option>
        </Select>
      </Row>
      <div className="table-responsive">
        <Table
          columns={tableColumns}
          dataSource={filteredPlaces}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>
    </Card>
  );
};

export default PlaceList;
