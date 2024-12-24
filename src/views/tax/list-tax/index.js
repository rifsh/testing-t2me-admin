import React, { useEffect } from "react";
import { Card, Table, Select, Input, Button, Row, Col, Menu } from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined,
  FormOutlined,
} from "@ant-design/icons";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import Flex from "components/shared-components/Flex";
import { useDispatch, useSelector } from "react-redux";
import { Form } from "antd";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import utils from "utils";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
import { setDialogVisible, setSelectedItem } from "store/slices/modalSlice";
import { editTax, fetchAllTax, filterTax } from "store/slices/taxSlice";
import {
  fetchAllCountires,
  getCoutryDetails,
  getPlaces,
} from "store/slices/locationSlice";
import Utils from "utils";

const { Option } = Select;

const TaxList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { filteredTax, loading, message } =
    useSelector((state) => state.tax) || {};
  const [form] = Form.useForm();
  const locationState = useSelector((state) => state?.locations) || {};
  const {
    loading: locationLoading,
    filteredPlaces,
    detailedCountryList,
  } = locationState;

  useEffect(() => {
    dispatch(fetchAllTax());
    dispatch(getCoutryDetails());
  }, [dispatch]);

  const handleSearch = (e) => {
    dispatch(filterTax({ searchTerm: e.target.value, status: null }));
  };

  const handleShowStatus = (status) => {
    dispatch(filterTax({ searchTerm: null, status }));
  };

  const handleUpdateStatus = (item) => {
    const newStatus = !item.status;
    const data = { status: newStatus, id: item.id };
    dispatch(setSelectedItem(data));
  };

  const handleOnSelect = () => {
    const place_id = form.getFieldValue("place_id");
    const country_id = form.getFieldValue("country_id");
    dispatch(fetchAllTax({ country_id, place_id }));
    if (country_id) {
      dispatch(getPlaces(country_id));
    }
  };

  const dropdownMenu = (row) => (
    <Menu>
      <Menu.Item
        onClick={() => navigate(`${APP_PREFIX_PATH}/tax/edit/${row.id}`)}
      >
        <Flex alignItems="center">
          <EyeOutlined />
          <span className="ml-2">Edit Tax</span>
        </Flex>
      </Menu.Item>
      <Menu.Item onClick={() => handleUpdateStatus(row)}>
        <Flex alignItems="center">
          <DeleteOutlined />
          <span className="ml-2">Change Status</span>
        </Flex>
      </Menu.Item>
    </Menu>
  );

  const tableColumns = [
    {
      title: "Tax Name",
      dataIndex: "tax_name",
      render: (tax_name) => <span>{tax_name || "N/A"}</span>,
      sorter: (a, b) => utils.antdTableSorter(a, b, "tax_name"),
    },
    {
      title: "Code",
      dataIndex: "code",
      render: (code) => <span>{code || "N/A"}</span>,
      sorter: (a, b) => utils.antdTableSorter(a, b, "code"),
    },
    {
      title: "Percentage",
      dataIndex: "percentage",
      render: (percentage) => <span>{percentage}%</span>,
      sorter: (a, b) => utils.antdTableSorter(a, b, "percentage"),
    },
    {
      title: "Category",
      dataIndex: "available_category",
      render: (category) => (
        <span className="capitalize">{category || "N/A"}</span>
      ),
      sorter: (a, b) => utils.antdTableSorter(a, b, "available_category"),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      render: (date) => <span>{new Date(date).toLocaleDateString()}</span>,
      sorter: (a, b) => utils.antdTableSorter(a, b, "created_at"),
    },
    Utils.statusColumnUtil(handleUpdateStatus),
    {
      title: "Actions",
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
      <Row gutter={16} justify="space-between" style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Flex>
            <Input
              placeholder="Search"
              prefix={<SearchOutlined />}
              onChange={handleSearch}
              className="mr-2"
            />
            <Select
              defaultValue="All"
              onChange={handleShowStatus}
              className="mr-2"
            >
              <Option value="All">All</Option>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Flex>
        </Col>
        <Col xs={24} sm={8} style={{ textAlign: "right" }}>
          <Button
            type="primary"
            icon={<FormOutlined />}
            onClick={() => navigate(`${APP_PREFIX_PATH}/tax/add`)}
          >
            Add Tax
          </Button>
        </Col>
      </Row>

      <Flex>
        <Form form={form}>
          <Row gutter={16} justify="space-between" style={{ marginBottom: 16 }}>
            <Col span={12}>
              <Form.Item name="country_id">
                <Select
                  placeholder="Choose a Country"
                  loading={locationLoading}
                  defaultValue={0}
                  onSelect={handleOnSelect}
                  style={{ width: "150px" }}
                >
                  <Option key={0} value={0}>
                    All Countries
                  </Option>
                  {detailedCountryList.map((country) => (
                    <Option key={country.id} value={country.id}>
                      {country.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col style={{ textAlign: "left" }}>
              <Form.Item name="place_id">
                <Select
                  placeholder="Choose a Place"
                  loading={locationLoading}
                  defaultValue={0}
                  onSelect={handleOnSelect}
                  style={{ width: "150px" }} // Custom width for the place select
                >
                  <Option key={0} value={0}>
                    All Places
                  </Option>
                  {filteredPlaces.map((place) => (
                    <Option key={place.id} value={place.id}>
                      {place.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Flex>

      <div className="table-responsive">
        <Table
          columns={tableColumns}
          dataSource={filteredTax}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <UpdateStatusModal
        responseMessage={message}
        getAllFunction={fetchAllTax}
        editFunction={editTax}
      />
    </Card>
  );
};

export default TaxList;
