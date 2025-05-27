import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Select,
  Input,
  Button,
  Modal,
  Descriptions,
  Dropdown,
} from "antd";
import {
  EyeOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  FormOutlined,
  MoreOutlined,
  EditOutlined,
} from "@ant-design/icons";
import Flex from "components/shared-components/Flex";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  editCoupon,
  editCouponStatus,
  fetchAllCoupons,
  filterCoupons,
  setEditItemId,
  setCouponDialogVisible,
  setCouponModalLoading,
} from "store/slices/couponSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { setDialogVisible, setSelectedItem } from "store/slices/modalSlice";
import Utils from "utils";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import { TextConstants } from "constants/TextConstant";
import StatusSubmitAndConfirmModal from "components/util-components/ModalItems/StatusSubmitModal";
import { isOrganizer } from "configs/UserAccessConfig";

const { Option } = Select;

const CouponList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const { type } = useParams();
  const {
    filteredCoupons,
    pagination,
    editable_status,
    loading,
    message,
    editItemId,
    dialogVisible,
    warningPagination,
    modalLoading,
    responseImpactData,
  } = useSelector((state) => state.coupons);
  const { responseData } = useSelector((state) => state.modalSlice);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  useEffect(() => {
    dispatch(
      fetchAllCoupons({
        ...DEFAULT_PAGE_SIZE,
        organizer: isOrganizer() ? false : null,
        event_code: Utils.getEventTypeCodeWithType(type),
      })
    );
  }, [dispatch]);

  const handlePagination = (page, size) => {
    dispatch(fetchAllCoupons({ page: page, size: size }));
  };
  const showModal = (coupon) => {
    setSelectedCoupon(coupon);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedCoupon(null);
  };

  const handleUpdateStatus = (item) => {
    const newStatus = !item.status;
    const data = { status: newStatus, id: item.id };
    dispatch(setSelectedItem(data));
    dispatch(setDialogVisible(true));
  };
  const handleEditTax = (id) => {
    dispatch(setEditItemId(id));
    dispatch(setCouponDialogVisible(true));
  };
  const handleModalSubmit = async () => {
    dispatch(setCouponModalLoading(true));
    navigate(`${APP_PREFIX_PATH}/coupon/edit/${editItemId}?type=${type}`);

    dispatch(setCouponDialogVisible(false));
    dispatch(setCouponModalLoading(false));
  };

  const handleModalCancel = () => {
    dispatch(setCouponDialogVisible(false));
  };

  const getDropdownMenu = (row) => [
    {
      key: "view",
      label: (
        <Flex alignItems="center">
          <EyeOutlined />
          <span className="ml-2">View Details</span>
        </Flex>
      ),
      onClick: () => showModal(row),
    },
    {
      key: "remark",
      label: (
        <Flex alignItems="center">
          <EditOutlined />
          <span className="ml-2">Edit Coupon</span>
        </Flex>
      ),
      onClick: () => handleEditTax(row.id),
    },
  ];

  const tableColumns = [
    {
      title: "Coupon Name",
      dataIndex: "name",
      sorter: (a, b) => Utils.antdTableSorter(a, b, "name"),
    },
    // {
    //   title: "Discount",
    //   dataIndex: "discount_percentage_amount",
    //   sorter: (a, b) => a.discount_percentage_amount - b.discount_percentage_amount,
    //   render: (value) => `${value}%`,
    // },
    {
      title: "Start Date",
      dataIndex: "start_date",
      defaultSortOrder: "descend",
      sorter: (a, b) => new Date(a.start_date) - new Date(b.start_date),
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      sorter: (a, b) => new Date(b.end_date) - new Date(a.end_date),
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
    },
    {
      title: "Max Uses",
      dataIndex: "max_uses",
      sorter: (a, b) => a.max_uses - b.max_uses,
    },
    Utils.statusColumnUtil(handleUpdateStatus),
    {
      title: "",
      dataIndex: "actions",
      render: (_, row) => (
        <Dropdown menu={{ items: getDropdownMenu(row) }} trigger={["click"]}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <Card>
      <Flex alignItems="center" className="mb-3" justifyContent="space-between">
        <SearchBarWithStatus fetchFunction={fetchAllCoupons} />
        <Button
          type="primary"
          icon={<FormOutlined />}
          onClick={() => navigate(`${APP_PREFIX_PATH}/coupon/add?type=${type}`)}
        >
          Add {type?.charAt(0)?.toUpperCase() + type?.slice(1)} Coupon
        </Button>
      </Flex>

      <Table
        columns={tableColumns}
        dataSource={filteredCoupons}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.size,
          total: pagination.total,
          onChange: (page, pageSize) => handlePagination(page, pageSize),
        }}
      />

      <Modal
        title="Coupon Details"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        {selectedCoupon && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Coupon Name">
              {selectedCoupon.name}
            </Descriptions.Item>
            <Descriptions.Item label="Discount Percentage">
              {selectedCoupon.discount_percentage_amount}%
            </Descriptions.Item>
            <Descriptions.Item label="Start Date">
              {selectedCoupon.start_date
                ? new Date(selectedCoupon.start_date).toLocaleDateString()
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="End Date">
              {selectedCoupon.end_date
                ? new Date(selectedCoupon.end_date).toLocaleDateString()
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Max Uses">
              {selectedCoupon.max_uses}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {selectedCoupon.status ? "Active" : "Inactive"}
            </Descriptions.Item>
            <Descriptions.Item label="Keywords">
              {selectedCoupon.key_words?.length > 0
                ? selectedCoupon.key_words.join(", ")
                : "None"}
            </Descriptions.Item>
            {/* <Descriptions.Item label="Coupon Description">
              {selectedCoupon.description || "No description available"}
            </Descriptions.Item> */}
            {selectedCoupon.thumbnail_image &&
              selectedCoupon.thumbnail_image !== "images" ? (
              <Descriptions.Item label="Thumbnail Image">
                <img
                  src={selectedCoupon.thumbnail_image}
                  alt="Offer Thumbnail"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    objectFit: "contain",
                  }}
                />
              </Descriptions.Item>
            ) : (
              <Descriptions.Item label="Thumbnail Image">
                No image available
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
      <WarningModal
        mode={"itemmodal"}
        visible={dialogVisible}
        title="Edit Coupon"
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
        editFunction={editCouponStatus}
        editable_status={editable_status}
        getAllFunction={(pageData) => fetchAllCoupons(pageData)}
        pageData={{ page: 1, size: 10 }}
        tableConfig={{
          title: "Active Schedules",
          dataKey: "items",
        }}
        responseData={responseImpactData}
        pagination={warningPagination}
        loading={loading}
      />
      <StatusSubmitAndConfirmModal
        editFunction={editCouponStatus}
        getAllFunction={fetchAllCoupons}
        responseData={responseData}
        responseMessage={message}
        pageData={DEFAULT_PAGE_SIZE}
        onSubmitMessage={TextConstants.StatusUpdatedSuccess}
        onCloseMessage={TextConstants.StatusUpdateCanceled}
      />
    </Card>
  );
};

export default CouponList;
