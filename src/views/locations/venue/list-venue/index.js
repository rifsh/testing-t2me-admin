import React, { useEffect } from "react";
import { Card, Table, Select, Input, Button, Menu, Row, Col } from "antd";
import {
  EyeOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  FormOutlined,
  EditOutlined,
} from "@ant-design/icons";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import Flex from "components/shared-components/Flex";
import { useDispatch, useSelector } from "react-redux";
import { Form } from "antd";
import { useNavigate } from "react-router-dom";

import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import utils from "utils";
import {
  editVenue,
  editVenueStatus,
  filterVenues,
  getPlaces,
  getSingleVenues,
  getVenues,
  setEditItemId,
  setLocationDialogVisible,
  setLocationModalLoading,
} from "store/slices/locationSlice";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
import { setDialogVisible, setSelectedItem } from "store/slices/modalSlice";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import { TextConstants } from "constants/TextConstant";
import StatusSubmitAndConfirmModal from "components/util-components/ModalItems/StatusSubmitModal";
import { resetSearchValue } from "store/slices/fliterSlice";
import usePaginationHook from "utils/hooks/usePaginationHandler";

const { Option } = Select;

const VenueList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { responseData } = useSelector((state) => state.modalSlice);
  const {
    filteredVenues,
    pagination,
    loading,
    filteredPlaces,
    editable_status,
    message,
    dialogVisible,
    modalLoading,
    warningPagination,
    editItemId,
    responseImpactData,
  } = useSelector((state) => state.locations);
  const [form] = Form.useForm();
  const handlePagination = usePaginationHook(getVenues);

  useEffect(() => {
    dispatch(getVenues(DEFAULT_PAGE_SIZE));
    return () => {
      dispatch(resetSearchValue());
    }
  }, [dispatch]);

  const handleViewDetails = async (id) => {
    await dispatch(getSingleVenues(id));
    navigate(`${APP_PREFIX_PATH}/venue/details/${id}`);
  };
  const handleUpdateStatus = (item) => {
    const newStatus = !item.status;
    const data = { status: newStatus, id: item.id };

    dispatch(setSelectedItem(data));
    dispatch(setDialogVisible(true));
  };
  // const handlePagination = (page, size) => {
  //   dispatch(getVenues({ page: page, size: size, search: searchValue }));
  // };
  const handleEditVenue = (id) => {
    dispatch(setEditItemId(id));
    dispatch(setLocationDialogVisible(true));
  };
  const handleModalSubmit = async () => {
    dispatch(setLocationModalLoading(true));
    navigate(`${APP_PREFIX_PATH}/venue/edit/${editItemId}`);
    dispatch(setLocationDialogVisible(false));
    dispatch(setLocationModalLoading(false));
  };

  const handleModalCancel = () => {
    dispatch(setLocationDialogVisible(false));
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
        <Flex alignItems="center" onClick={() => handleEditVenue(row.id)}>
          <EditOutlined />
          <span className="ml-2">Edit Venue</span>
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
      title: "Place",
      dataIndex: ["place", "name"],
      render: (name) => <span>{name || "N/A"}</span>,
      sorter: (a, b) => utils.antdTableObjectSorter(a, b, ["place", "name"]),
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
      <Row gutter={16} justify={"space-between"} style={{ marginBottom: 16 }}>
        {/* <Col xs={24} sm={8}>
          <PlaceWithCountryForm
            allPlaceVisible={true}
            form={form}
            onSelect={(id) => handleSelectPlace(id)}
          />
        </Col> */}
        <SearchBarWithStatus
          fetchFunction={getVenues}
          additionalFilters={[
            {
              options: filteredPlaces,
              placeholder: "Please choose a Place",
              formName: "place_id",
              isAutoComplete: true,
              onClick: () => {
                getPlaces({});
              },
            },
          ]}
        />

        <Col xs={24} sm={8} style={{ textAlign: "right" }}>
          <Button
            type="primary"
            icon={<FormOutlined />}
            onClick={() => navigate(`${APP_PREFIX_PATH}/venue/add`)}
          >
            Add Venue
          </Button>
        </Col>
      </Row>

      {/* <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12}>
          <Input
            placeholder="Search"
            prefix={<SearchOutlined />}
            onChange={handleSearch}
            style={{ width: "100%" }}
          />
        </Col>
        <Col xs={24} sm={12}>
          <Select
            defaultValue="All"
            onChange={handleShowStatus}
            placeholder="Status"
            style={{ width: "100%" }}
          >
            <Option value="All">All status</Option>
            <Option value={"Active"}>Active</Option>
            <Option value={"Inactive"}>Inactive</Option>
          </Select>
        </Col>
      </Row> */}
      {/* <SearchBarWithStatus fetchFunction={getVenues} /> */}

      <div className="table-responsive">
        <Table
          columns={tableColumns}
          dataSource={filteredVenues}
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
        mode={"itemmodal"}
        visible={dialogVisible}
        title="Edit Venue"
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
        editFunction={editVenueStatus}
        getAllFunction={(pageData) => getVenues(pageData)}
        pageData={{ page: 1, size: 10 }}
        tableConfig={{
          title: "Active Schedules",
          dataKey: "items",
        }}
        editable_status={editable_status}
        responseData={responseImpactData}
        pagination={warningPagination}
        loading={loading}
      />

      <StatusSubmitAndConfirmModal
        editFunction={editVenueStatus}
        getAllFunction={getVenues}
        responseData={responseData}
        responseMessage={message}
        pageData={DEFAULT_PAGE_SIZE}
        onSubmitMessage={TextConstants.StatusUpdatedSuccess}
        onCloseMessage={TextConstants.StatusUpdateCanceled}
      />
    </Card>
  );
};

export default VenueList;
