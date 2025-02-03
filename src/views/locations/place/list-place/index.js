import React, { useEffect } from "react";
import {
  Card,
  Table,
  Menu,
  Button,
  Row,
  Col,
  Form,
} from "antd";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import { TextConstants } from "constants/TextConstant";
import {
  EyeOutlined,
  FormOutlined,
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
  editPlaceStatus,
  getPlaces,
  getSinglePlace,
  setLocationDialogVisible,
  setLocationModalLoading,
  getCoutryDetails,
  setEditItemId,
} from "store/slices/locationSlice";
import { setDialogVisible, setSelectedItem } from "store/slices/modalSlice";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";

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
    dialogVisible,
    modalLoading,
    responseImpactData,
    editItemId,
  } = useSelector((state) => state.locations);


  useEffect(() => {
    dispatch(getPlaces(DEFAULT_PAGE_SIZE));
  }, [dispatch]);

  const handlePagination = (page, size) => {
    dispatch(getPlaces({ page: page, size: size }));
  };

  const handleViewDetails = async (id) => {
    await dispatch(getSinglePlace(id));
    navigate(`${APP_PREFIX_PATH}/place/details/${id}`);
  };

  const handleEditPlace = (id) => {
    dispatch(setEditItemId(id));
    dispatch(setLocationDialogVisible(true));
  };

  const handleModalSubmit = async () => {
    dispatch(setLocationModalLoading(true));
    navigate(`${APP_PREFIX_PATH}/place/edit/${editItemId}`);
    dispatch(setLocationDialogVisible(false));
    dispatch(setLocationModalLoading(false));
  };

  const handleModalCancel = () => {
    dispatch(setLocationDialogVisible(false));
  };

  const handleUpdateStatus = (item) => {
    const newStatus = !item.status;
    const data = { status: newStatus, id: item.id };
    dispatch(setSelectedItem(data));
  };

  const dropdownMenu = (row) => (
    <Menu>
      <Menu.Item>
        <Flex alignItems="center" onClick={() => handleViewDetails(row.id)}>
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
      <Row gutter={16} justify="space-between" align="middle" wrap={false}>
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
      <WarningModal
        visible={dialogVisible}
        title="Edit Place"
        details={TextConstants.DefaultEditContent1}
        warningMessage="Do you want to proceed to the edit page?"
        onSubmit={handleModalSubmit}
        onCancel={handleModalCancel}
        confirmText="Proceed to Edit"
        cancelText="Cancel"
        loading={modalLoading}
      />

      <UpdateStatusModal
        responseMessage={message}
        editFunction={editPlaceStatus}
        getAllFunction={(pageData) => getPlaces(pageData)}
        pageData={{ page: 1, size: 10 }}
        tableConfig={{
          title: "Active Schedules",
          dataKey: "active_schedules"
        }}
        editable_status={editable_status}
        responseData={responseImpactData}
      />


    </Card>
  );
};

export default PlaceList;