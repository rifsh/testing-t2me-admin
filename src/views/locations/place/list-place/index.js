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
import { setDialogVisible, setSelectedItem } from "store/slices/modalSlice";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import UserForm from "views/user/form-user";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";

const { Option } = Select;

const PlaceList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    filteredPlaces,
    detailedCountryList,
    editable_status,
    message,
    loading,
    pagination,
  } = useSelector((state) => state.locations);

  useEffect(() => {
    dispatch(getPlaces(DEFAULT_PAGE_SIZE));

    // dispatch(getCoutryDetails());
  }, [dispatch]);
  const handlePagination = (page, size) => {
    dispatch(getPlaces({ page: page, size: size }));
  };
  const handleEditPlace = async (id) => {
    navigate(`${APP_PREFIX_PATH}/place/edit/${id}`);
  };
  const handleUpdateStatus = (item) => {
    const newStatus = !item.status;
    const data = { status: newStatus, id: item.id };

    dispatch(setSelectedItem(data));
  };

  const dropdownMenu = (row) => (
    <Menu>
      {/* <Menu.Item>
        <Flex alignItems="center">
          <EyeOutlined />
          <span className="ml-2">View Details</span>
        </Flex>
      </Menu.Item> */}
      <Menu.Item>
        <Flex alignItems="center" onClick={() => handleEditPlace(row.id)}>
          <EditOutlined />
          <span className="ml-2">Edit Place</span>
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
  const [form] = Form.useForm();

  return (
    <Card>
      <Row gutter={16} justify="space-between" align="" wrap={false}>
        <SearchBarWithStatus
          fetchFunction={getPlaces}
          additionalFilters={[
            {
              options: detailedCountryList,
              placeholder: "Please choose a country",
              formName: "country_id",
              isAutoComplete: true,
              onClick: () => {
                dispatch(getCoutryDetails());
              },
            },
          ]}
        />

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

      <div className="table-responsive">
        <Table
          columns={tableColumns}
          dataSource={filteredPlaces}
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
      <UpdateStatusModal
        responseMessage={message}
        editFunction={editPlace}
        getAllFunction={getPlaces}
        editable_status={editable_status}
      />
    </Card>
  );
};

export default PlaceList;
