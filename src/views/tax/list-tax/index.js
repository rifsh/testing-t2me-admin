import React, { useEffect } from "react";
import { Card, Table, Select, Input, Button, Tag, Menu, Row, Col } from "antd";
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
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import utils from "utils";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
import { setDialogVisible, setSelectedItem } from "store/slices/modalSlice";
import { fetchAllTax } from "store/slices/taxSlice";
import { fetchAllCountires } from "store/slices/locationSlice";

const { Option } = Select;

const TaxList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { allTax, loading, message } = useSelector((state) => state.tax) || {};
  const [form] = Form.useForm();
  const locationState = useSelector((state) => state?.locations) || {};
  const taxState = useSelector((state) => state?.tax) || {};

  const { loading: locationLoading, selectedPlace, countries } = locationState;

  useEffect(() => {
    dispatch(fetchAllTax(1));
    dispatch(fetchAllCountires());
  }, [dispatch]);

  const handleSearch = (e) => {
    // Implement tax search functionality
  };

  const handleShowStatus = (status) => {
    // Implement tax status filter
  };

  const handleUpdateStatus = (item) => {
    const newStatus = !item.status;
    const data = { status: newStatus, id: item.id };
    dispatch(setSelectedItem(data));
  };
  const handleOnSelect = () => {
    dispatch(fetchAllTax(form.getFieldValue.country_id));
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
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status ? "success" : "error"}>
          {status ? "Active" : "Inactive"}
        </Tag>
      ),
    },
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
          <Input
            placeholder="Search tax"
            prefix={<SearchOutlined />}
            onChange={handleSearch}
            style={{ width: "100%" }}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Form form={form}>
            <Form.Item name="country_id" label="Country name">
              <Select
                className="w-100"
                placeholder="Choose a Country"
                loading={locationLoading}
                value={form.getFieldValue("country_id")}
                onChange={(value) => {
                  form.setFieldsValue({ country_id: value });
                  dispatch(fetchAllTax(value)); // Fetch tax data for the selected country
                }}
              >
                {countries && countries.length > 0 ? (
                  countries.map((country) => (
                    <Option key={country.id} value={country.id}>
                      {country.country}
                    </Option>
                  ))
                ) : (
                  <Option disabled>No countries available</Option>
                )}
              </Select>
            </Form.Item>
          </Form>
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

      <div className="table-responsive">
        <Table
          columns={tableColumns}
          dataSource={allTax}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>
      <UpdateStatusModal
        responseMessage={message}
        getAllFunction={fetchAllTax}
      />
    </Card>
  );
};

export default TaxList;
