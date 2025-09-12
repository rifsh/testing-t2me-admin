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
import {
  editTax,
  fetchAllTax,
  filterTax,
  setTaxDialogVisible,
  setTaxModalLoading,
  setEditItemId,
  editTaxStatus,
} from "store/slices/taxSlice";
import {
  fetchAllCountires,
  getCoutryDetails,
  getPlaces,
} from "store/slices/locationSlice";
import Utils from "utils";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import StatusSubmitAndConfirmModal from "components/util-components/ModalItems/StatusSubmitModal";

import { TextConstants } from "constants/TextConstant";
import usePaginationHook from "utils/hooks/usePaginationHandler";
import usePermissions from "utils/hooks/usePermissions";
import { PERMISSIONS } from "constants/RolesPermissionConstants";

const { Option } = Select;

const TaxList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    filteredTax,
    loading,
    editable_status,
    pagination,
    warningPagination,
    message,
    dialogVisible,
    modalLoading,
    editItemId,
    responseImpactData,
  } = useSelector((state) => state.tax) || {};
  const [form] = Form.useForm();
  const locationState = useSelector((state) => state?.locations) || {};
  const { responseData } = useSelector((state) => state.modalSlice);
  const {
    loading: locationLoading,
    filteredPlaces,
    detailedCountryList,
  } = locationState;
  const handlePagination = usePaginationHook(fetchAllTax);
  const { hasPermission } = usePermissions();
  useEffect(() => {
    dispatch(fetchAllTax(DEFAULT_PAGE_SIZE));
  }, [dispatch]);

  const handleUpdateStatus = (item) => {
    const newStatus = !item.status;
    const data = { status: newStatus, id: item.id };
    dispatch(setSelectedItem(data));
    dispatch(setDialogVisible(true));
  };
  // const handlePagination = (page, size) => {
  //   dispatch(fetchAllTax({ page: page, size: size }));
  // };

  const handleEditTax = (id) => {
    dispatch(setEditItemId(id));
    dispatch(setTaxDialogVisible(true));
  };
  const handleModalSubmit = async () => {
    dispatch(setTaxModalLoading(true));
    navigate(`${APP_PREFIX_PATH}/tax/edit/${editItemId}`);
    console.log(editItemId, "9234239423490823498234098234908");
    dispatch(setTaxDialogVisible(false));
    dispatch(setTaxModalLoading(false));
  };

  const handleModalCancel = () => {
    dispatch(setTaxDialogVisible(false));
  };
  const dropdownMenu = (row) => (
    <Menu>
      <Menu.Item onClick={() => handleEditTax(row.id)}>
        <Flex alignItems="center">
          <EyeOutlined />
          <span className="ml-2">Edit Tax</span>
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
    Utils.statusColumnUtil(handleUpdateStatus, !hasPermission(PERMISSIONS.APPLICATIONS.SERVICES.GENERAL.TAX.UPDATE_TAX_STATUS)),
    {
      title: "",
      dataIndex: "actions",
      render: (_, elm) => (
        hasPermission(PERMISSIONS.APPLICATIONS.SERVICES.GENERAL.TAX.EDIT_TAXES) ? (
          <div className="text-right">
            <EllipsisDropdown menu={dropdownMenu(elm)} />
          </div>
        ) : null
      ),
    },
  ];

  return (
    <Card>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <SearchBarWithStatus
          fetchFunction={fetchAllTax}
          additionalFilters={[
            // {
            //   options: detailedCountryList,
            //   placeholder: "Please choose a country",
            //   formName: "country_id",
            //   isAutoComplete: true,
            //   onClick: () => {
            //     dispatch(getCoutryDetails());
            //   },
            // },
            {
              options: filteredPlaces,
              placeholder: "Please choose a Place",
              formName: "place_id",
              isAutoComplete: true,
              onClick: () => {
                dispatch(getPlaces());
              },
            },
          ]}
        />
        {hasPermission(PERMISSIONS.APPLICATIONS.SERVICES.GENERAL.TAX.ADD_TAXES) && <Col style={{ textAlign: "right" }}>
          <Button
            type="primary"
            icon={<FormOutlined />}
            onClick={() => navigate(`${APP_PREFIX_PATH}/tax/add`)}
          >
            Add Tax
          </Button>
        </Col>}
      </Row>

      <div className="table-responsive">
        <Table
          columns={tableColumns}
          dataSource={filteredTax}
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
        title="Edit Tax"
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
        editFunction={editTaxStatus}
        getAllFunction={(pageData) => fetchAllTax(pageData)}
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
        editFunction={editTaxStatus}
        getAllFunction={fetchAllTax}
        responseData={responseData}
        responseMessage={message}
        pageData={DEFAULT_PAGE_SIZE}
        onSubmitMessage={TextConstants.StatusUpdatedSuccess}
        onCloseMessage={TextConstants.StatusUpdateCanceled}
      />
    </Card>
  );
};

export default TaxList;
