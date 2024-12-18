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
  EditOutlined,
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
  editPlace,
  filterPlaces,
  getCoutryDetails,
  getPlaces,
} from "store/slices/locationSlice";
import {
  setDialogVisible,
  setSelectedItem,
} from "store/slices/statusModalSlice";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";

const { Option } = Select;

const PlaceList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { filteredPlaces, detailedCountryList, message, loading } = useSelector(
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

  const handleEditPlace = async (id) => {
    navigate(`${APP_PREFIX_PATH}/place/edit/${id}`);
  };
  const handleUpdateStatus = (item) => {
    const newStatus = !item.status;
    const data = { status: newStatus, id: item.id };

    dispatch(setDialogVisible(true));
    dispatch(setSelectedItem(data));
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
        <Flex alignItems="center" onClick={() => handleEditPlace(row.id)}>
          <EditOutlined />
          <span className="ml-2">Edit Place</span>
        </Flex>
      </Menu.Item>
    </Menu>
  );

  const tableColumns = [
    // {
    //   title: "Country ID",
    //   dataIndex: "country_id",
    //   sorter: (a, b) => utils.antdTableSorter(a, b, "country_id"),
    // },
    // Todo : it should be country name
    {
      title: "Place Name",
      dataIndex: "name",
      sorter: (a, b) => utils.antdTableSorter(a, b, "name"),
    },

    {
      title: "Created Date",
      dataIndex: "created_at",
      render: (createdDate) => (
        <span>{dayjs(createdDate).format(DATE_FORMAT_DD_MM_YYYY)}</span>
      ),
      sorter: (a, b) => utils.antdTableSorter(a, b, "created_at"),
    },
    utils.statusColumnUtil(handleUpdateStatus),

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
      <Row gutter={16} justify="space-between">
        <Col xs={24} sm={8}>
          <Form.Item name="country_id">
            <Select
              className="w-100"
              placeholder="Choose a Country"
              loading={loading}
              defaultValue={"All Country"}
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
        gutter={16}
        justify="space-between"
        style={{ paddingBottom: "15px" }}
      >
        <Col xs={24} sm={8}>
          <Input
            placeholder="Search"
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </Col>
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
      <UpdateStatusModal
        responseMessage={message}
        editFunction={editPlace}
        getAllFunction={getPlaces}
      />
    </Card>
  );
};

export default PlaceList;
