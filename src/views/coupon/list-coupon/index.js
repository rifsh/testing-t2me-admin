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
  Typography,
  Collapse,
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
  editCouponStatus,
  fetchAllCoupons,
  setEditItemId,
  setCouponDialogVisible,
  setCouponModalLoading,
  resetGeneratedCouponCode,
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
import usePermissions from "utils/hooks/usePermissions";
import { PERMISSIONS } from "constants/RolesPermissionConstants";
import CDNImage from "components/layout-components/Image/CDNImage";

const { Paragraph } = Typography;
const { Panel } = Collapse;

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
    couponDetails,
    loading,
    message,
    editItemId,
    dialogVisible,
    warningPagination,
    modalLoading,
    responseImpactData,
  } = useSelector((state) => state.coupons);
  const { responseData } = useSelector((state) => state.modalSlice);
  const { hasPermission, hasAnyPermission } = usePermissions();
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
        hasPermission(PERMISSIONS.APPLICATIONS.SERVICES.GENERAL.COUPON.GET_COUPON_DETAIL) ? (
          < Flex alignItems="center" >
            <EyeOutlined />
            <span className="ml-2">View Details</span>
          </Flex >

        ) : null
      ),
      onClick: () => showModal(row),
    },
    {
      key: "remark",
      label: (
        hasPermission(PERMISSIONS.APPLICATIONS.SERVICES.GENERAL.COUPON.UPDATE_COUPON_STATUS) ? (
          < Flex alignItems="center" >
            <EditOutlined />
            <span className="ml-2">Edit Coupon</span>
          </Flex >
        ) : null
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
    Utils.statusColumnUtil(handleUpdateStatus, !hasPermission(PERMISSIONS.APPLICATIONS.SERVICES.GENERAL.COUPON.UPDATE_COUPON_STATUS)),
    {
      title: "Validity Status",
      dataIndex: "validity_status",
      render: (_, record) => {
        const status = Utils.getCouponPeriodStatus(record);
        const colorMap = {
          Upcoming: "gold",
          Running: "green",
          Expired: "red",
          "No Validity": "gray",
        };
        return (
          <span
            style={{
              color: colorMap[status],
              fontWeight: 600,
            }}
          >
            {status}
          </span>
        );
      },
    },
    {
      title: "",
      dataIndex: "actions",
      render: (_, row) => (
        hasAnyPermission([PERMISSIONS.APPLICATIONS.SERVICES.GENERAL.COUPON.GET_COUPON_DETAIL, PERMISSIONS.APPLICATIONS.SERVICES.GENERAL.COUPON.UPDATE_COUPON_STATUS]) ? (
          < Dropdown menu={{ items: getDropdownMenu(row) }} trigger={["click"]} >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown >

        ) : null
      ),
    },
  ];


  return (
    <Card>
      <Flex alignItems="center" className="mb-3" justifyContent="space-between">
        <SearchBarWithStatus fetchFunction={fetchAllCoupons} />
        {hasPermission(PERMISSIONS.APPLICATIONS.SERVICES.GENERAL.COUPON.ADD_COUPONS) && <Button
          type="primary"
          icon={<FormOutlined />}
          onClick={() => {
            dispatch(resetGeneratedCouponCode())
            navigate(`${APP_PREFIX_PATH}/coupon/add?type=${type}`)
          }}
        >
          Add {type?.charAt(0)?.toUpperCase() + type?.slice(1)} Coupon
        </Button>}
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
        className="coupon-details-modal"
      >
        {selectedCoupon && (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                {selectedCoupon?.thumbnail_image && selectedCoupon?.thumbnail_image !== "images" ? (
                  <div className="flex-shrink-0">
                    <CDNImage
                      src={`${selectedCoupon?.thumbnail_image}?v=${selectedCoupon?.updated_at}`}
                      alt="Coupon Thumbnail"
                      height={80}
                      width={80}
                      className="rounded-lg object-cover border-2 border-gray-200"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <span className="text-gray-400 text-xs text-center px-2">No Image</span>
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCoupon?.name}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedCoupon.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {selectedCoupon.status ? 'Active Schedule' : 'Inactive Schedule'}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedCoupon.is_active ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {selectedCoupon.is_active ? 'Active Coupon' : 'Inactive Coupon'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                {selectedCoupon?.is_percentage ? (
                  <div className="text-3xl font-bold text-blue-600">
                    {selectedCoupon.discount_percentage_amount}% OFF
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-blue-600">
                    {selectedCoupon.discount_percentage_amount?.toFixed(2)}
                  </div>
                )
                }
                <div className="text-sm text-gray-500 mt-1">Discount</div>
              </div>
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Core Information */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Validity Period</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Start Date</span>
                      <span className="text-sm text-gray-900">
                        {selectedCoupon.start_date ? new Date(selectedCoupon.start_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">End Date</span>
                      <span className="text-sm text-gray-900">
                        {selectedCoupon.end_date ? new Date(selectedCoupon.end_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Usage Limits</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Max Uses</span>
                      <span className="text-sm text-gray-900">{selectedCoupon.max_uses}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Used Count</span>
                      <span className="text-sm text-gray-900">{selectedCoupon.used_count}</span>
                    </div>
                    {/* <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Remaining Uses</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {selectedCoupon.max_uses - selectedCoupon.used_count}
                      </span>
                    </div> */}
                  </div>
                </div>
              </div>

              {/* Right Column - Additional Details */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Min Purchase</span>
                      <span className="text-sm text-gray-900">{selectedCoupon.min_purchase_amount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Date Required</span>
                      <span className={`text-sm ${selectedCoupon.date_required ? 'text-green-600' : 'text-gray-600'}`}>
                        {selectedCoupon.date_required ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Coupon Type</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`text-center py-2 rounded ${selectedCoupon.is_general ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                      <div className="text-sm font-medium">General</div>
                      <div className="text-xs">{selectedCoupon.is_general ? 'Yes' : 'No'}</div>
                    </div>
                    <div className={`text-center py-2 rounded ${selectedCoupon.is_single ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      <div className="text-sm font-medium">Single Use</div>
                      <div className="text-xs">{selectedCoupon.is_single ? 'Yes' : 'No'}</div>
                    </div>
                    <div className={`text-center py-2 rounded ${selectedCoupon.is_offline ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>
                      <div className="text-sm font-medium">Offline</div>
                      <div className="text-xs">{selectedCoupon.is_offline ? 'Yes' : 'No'}</div>
                    </div>
                    <div className={`text-center py-2 rounded ${selectedCoupon.is_reusable ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'}`}>
                      <div className="text-sm font-medium">Reusable</div>
                      <div className="text-xs">{selectedCoupon.is_reusable ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {selectedCoupon.key_words?.length > 0 && (
              <Collapse
                bordered={false}
                defaultActiveKey={['0']} // Set to empty array [] if you want it collapsed by default
                className="bg-gray-50 rounded-lg"
              >
                <Panel
                  header={
                    <h3 className="text-lg font-semibold text-gray-900 m-0">
                      Keywords ({selectedCoupon.key_words.length})
                    </h3>
                  }
                  key="1"
                >
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedCoupon.key_words.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {keyword}
                        <Paragraph
                          copyable={{
                            text: keyword,
                            tooltips: ['Copy keyword', 'Copied!']
                          }}
                          className="ml-2 mb-0"
                        />
                      </span>
                    ))}
                  </div>
                </Panel>
              </Collapse>
            )}

            {/* Weekday Associations */}
            {selectedCoupon.weekday_associations?.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Valid Days</h3>
                <div className="grid grid-cols-7 gap-2">
                  {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => {
                    const isActive = selectedCoupon.weekday_associations.some(assoc => assoc.weekday === day);
                    return (
                      <div
                        key={day}
                        className={`text-center py-2 rounded-lg ${isActive ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}
                      >
                        <div className="text-sm font-medium">{day.slice(0, 3)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Timeline</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Created</span>
                  <span className="text-sm text-gray-900">
                    {new Date(selectedCoupon.created_at).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Last Updated</span>
                  <span className="text-sm text-gray-900">
                    {new Date(selectedCoupon.updated_at).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
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
