import React, { useEffect, useState } from "react";
import { Card, Table, Button, Modal, Descriptions, Dropdown, Menu } from "antd";
import {
  EyeOutlined,
  FormOutlined,
  MoreOutlined,
  EditOutlined,
} from "@ant-design/icons";
import Flex from "components/shared-components/Flex";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  editOffer,
  editOfferStatus,
  fetchAllOffers,
  setEditItemId,
  setOfferDialogVisible,
  setOfferModalLoading,
} from "store/slices/offerSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { setDialogVisible, setSelectedItem } from "store/slices/modalSlice";
import Utils from "utils";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import { TextConstants } from "constants/TextConstant";
import StatusSubmitAndConfirmModal from "components/util-components/ModalItems/StatusSubmitModal";
import { EventCodeConstants, EventType } from "constants/AppConstants";
import usePaginationHook from "utils/hooks/usePaginationHandler";
import { isOrganizer } from "configs/UserAccessConfig";
import usePermissions from "utils/hooks/usePermissions";
import { PERMISSIONS } from "constants/RolesPermissionConstants";
import CDNImage from "components/layout-components/Image/CDNImage";

const OfferList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const { type } = useParams();
  const {
    filteredOffers,
    pagination,
    loading,
    editable_status,
    message,
    editItemId,
    dialogVisible,
    warningPagination,
    modalLoading,
    responseImpactData,
  } = useSelector((state) => state.offers);
  const { responseData } = useSelector((state) => state.modalSlice);
  const handlePagination = usePaginationHook(fetchAllOffers);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const { hasPermission, hasAnyPermission } = usePermissions();

  useEffect(() => {
    dispatch(
      fetchAllOffers({
        ...DEFAULT_PAGE_SIZE,
        organizer: isOrganizer() ? false : null,
        event_code: Utils.getEventTypeCodeWithType(type),
      })
    );
  }, [dispatch]);

  const showModal = (offer) => {
    setSelectedOffer(offer);
    console.log(offer);

    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedOffer(null);
  };
  const handleUpdateStatus = (item) => {
    const newStatus = !item.status;
    const data = { status: newStatus, id: item.id };

    dispatch(setSelectedItem(data));
    dispatch(setDialogVisible(true));
  };
  const handleEditTax = (id) => {
    dispatch(setEditItemId(id));
    dispatch(setOfferDialogVisible(true));
  };
  const handleModalSubmit = async () => {
    dispatch(setOfferModalLoading(true));
    navigate(`${APP_PREFIX_PATH}/offer/edit/${editItemId}?type=${type}`);
    dispatch(setOfferDialogVisible(false));
    dispatch(setOfferModalLoading(false));
  };

  const handleModalCancel = () => {
    dispatch(setOfferDialogVisible(false));
  };
  const getDropdownMenu = (row) => [
    {
      key: "view",
      label: (
        hasPermission(PERMISSIONS.APPLICATIONS.SERVICES.GENERAL.OFFER.GET_OFFER_DETAIL) ? (
          <Flex alignItems="center">
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
        hasPermission(PERMISSIONS.APPLICATIONS.SERVICES.GENERAL.OFFER.EDIT_OFFERS) ? (
          <Flex alignItems="center">
            <EditOutlined />
            <span className="ml-2">Edit Offer</span>
          </Flex >
        ) : null
      ),
      onClick: () => handleEditTax(row.id),
    },
  ];

  const dropdownMenu = (row) => (
    <Menu>
      {/* View Details Menu Item */}
      {hasPermission(PERMISSIONS.APPLICATIONS.SERVICES.GENERAL.OFFER.GET_OFFER_DETAIL) && (
        <Menu.Item key="view">
          <Flex alignItems="center"
            onClick={() => showModal(row)}
          >
            <EyeOutlined />
            <span className="ml-2">View Details</span>
          </Flex >
        </Menu.Item>
      )
      }

      {/* Edit Seat Structure Menu Item */}
      {
        isOrganizer() ? (
          hasPermission(PERMISSIONS.APPLICATIONS.SERVICES.GENERAL.OFFER.GET_OFFER_DETAIL) && (
            <Menu.Item key="edit-organizer">
              <Flex alignItems="center"
                onClick={() => handleEditTax(row.id)}
              >
                <EditOutlined />
                <span className="ml-2">Edit Offer</span>
              </Flex >
            </Menu.Item>
          )
        ) : (
          hasPermission(PERMISSIONS.APPLICATIONS.SERVICES.GENERAL.OFFER.EDIT_OFFERS) && (
            <Menu.Item key="edit">
              <Flex alignItems="center"
                onClick={() => handleEditTax(row.id)}
              >
                <EditOutlined />
                <span className="ml-2">Edit Offer</span>
              </Flex >
            </Menu.Item >
          )
        )
      }
    </Menu >
  );

  const tableColumns = [
    {
      title: "Offer Name",
      dataIndex: "name",
      sorter: (a, b) => Utils.antdTableSorter(a, b, "name"),
    },
    // {
    //   title: "Discount Percentage",
    //   dataIndex: "discount_percentage",
    //   sorter: (a, b) => a.discount_percentage - b.discount_percentage,
    // },
    {
      title: "Start Date",
      dataIndex: "start_date",
      sorter: (a, b) => new Date(a.start_date) - new Date(b.start_date),
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      sorter: (a, b) => new Date(a.end_date) - new Date(b.end_date),
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
    },
    {
      title: "Max Users",
      dataIndex: "max_uses",
      sorter: (a, b) => a.max_uses - b.max_uses,
    },
    // Utils.statusColumnUtil(handleUpdateStatus),
    Utils.statusColumnUtil(handleUpdateStatus, !hasPermission(PERMISSIONS.APPLICATIONS.SERVICES.GENERAL.OFFER.UPDATE_OFFER_STATUS)),

    {
      title: "",
      dataIndex: "actions",
      render: (_, row) => (
        hasAnyPermission([PERMISSIONS.APPLICATIONS.SERVICES.GENERAL.OFFER.GET_OFFER_DETAIL, PERMISSIONS.APPLICATIONS.SERVICES.GENERAL.OFFER.EDIT_OFFERS]) ? (
          <Dropdown menu={{ items: getDropdownMenu(row) }} trigger={["click"]}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        ) : null
      ),
    },
  ];

  return (
    <Card>
      <Flex alignItems="center" className="mb-3" justifyContent="space-between">
        <SearchBarWithStatus fetchFunction={fetchAllOffers} />
        {isOrganizer ? (
          hasPermission(PERMISSIONS.APPLICATIONS.SERVICES.GENERAL.OFFER.ADD_ORGANIZER_OFFERS) && (
            <Button
              type="primary"
              icon={<FormOutlined />}
              onClick={() => navigate(`${APP_PREFIX_PATH}/offer/add?type=${type}`)}
            >
              Add {type?.charAt(0)?.toUpperCase() + type?.slice(1)} Offer
            </Button>
          )
        ) : (
          hasPermission(PERMISSIONS.APPLICATIONS.SERVICES.GENERAL.OFFER.ADD_OFFERS) && (
            <Button
              type="primary"
              icon={<FormOutlined />}
              onClick={() => navigate(`${APP_PREFIX_PATH}/offer/add?type=${type}`)}
            >
              Add {type?.charAt(0)?.toUpperCase() + type?.slice(1)} Offer
            </Button>
          )
        )}
      </Flex>
      <Table
        columns={tableColumns}
        dataSource={filteredOffers}
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
        {selectedOffer && (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                {selectedOffer.thumbnail_image && selectedOffer.thumbnail_image !== "images" ? (
                  <div className="flex-shrink-0">
                    <CDNImage
                      src={selectedOffer.thumbnail_image}
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
                  <h2 className="text-2xl font-bold text-gray-900">{selectedOffer.name}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedOffer.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {selectedOffer.status ? 'Active Schedule' : 'Inactive Schedule'}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedOffer.is_active ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {selectedOffer.is_active ? 'Active Offer' : 'Inactive Offer'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                {selectedOffer?.is_percentage ? (
                  <div className="text-3xl font-bold text-blue-600">
                    {selectedOffer.discount_percentage_amount}% OFF
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-blue-600">
                    {selectedOffer.discount_percentage_amount?.toFixed(2)}
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
                        {selectedOffer.start_date ? new Date(selectedOffer.start_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">End Date</span>
                      <span className="text-sm text-gray-900">
                        {selectedOffer.end_date ? new Date(selectedOffer.end_date).toLocaleDateString('en-US', {
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
                      <span className="text-sm text-gray-900">{selectedOffer.max_uses}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Used Count</span>
                      <span className="text-sm text-gray-900">{selectedOffer.used_count}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Remaining Uses</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {selectedOffer.max_uses - selectedOffer.used_count}
                      </span>
                    </div>
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
                      <span className="text-sm text-gray-900">{selectedOffer.min_purchase_amount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Date Required</span>
                      <span className={`text-sm ${selectedOffer.date_required ? 'text-green-600' : 'text-gray-600'}`}>
                        {selectedOffer.date_required ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Coupon Type</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`text-center py-2 rounded ${selectedOffer.is_general ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                      <div className="text-sm font-medium">General</div>
                      <div className="text-xs">{selectedOffer.is_general ? 'Yes' : 'No'}</div>
                    </div>
                    <div className={`text-center py-2 rounded ${selectedOffer.is_single ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      <div className="text-sm font-medium">Single Use</div>
                      <div className="text-xs">{selectedOffer.is_single ? 'Yes' : 'No'}</div>
                    </div>
                    <div className={`text-center py-2 rounded ${selectedOffer.is_offline ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>
                      <div className="text-sm font-medium">Offline</div>
                      <div className="text-xs">{selectedOffer.is_offline ? 'Yes' : 'No'}</div>
                    </div>
                    <div className={`text-center py-2 rounded ${selectedOffer.is_reusable ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'}`}>
                      <div className="text-sm font-medium">Reusable</div>
                      <div className="text-xs">{selectedOffer.is_reusable ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Keywords Section */}
            {selectedOffer.key_words?.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedOffer.key_words.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Weekday Associations */}
            {selectedOffer.weekday_associations?.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Valid Days</h3>
                <div className="grid grid-cols-7 gap-2">
                  {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => {
                    const isActive = selectedOffer.weekday_associations.some(assoc => assoc.weekday === day);
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
                    {new Date(selectedOffer.created_at).toLocaleString('en-US', {
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
                    {new Date(selectedOffer.updated_at).toLocaleString('en-US', {
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
        title="Edit Offer"
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
        editFunction={editOfferStatus}
        getAllFunction={(pageData) => fetchAllOffers(pageData)}
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
        editFunction={editOfferStatus}
        getAllFunction={fetchAllOffers}
        responseData={responseData}
        responseMessage={message}
        pageData={DEFAULT_PAGE_SIZE}
        onSubmitMessage={TextConstants.StatusUpdatedSuccess}
        onCloseMessage={TextConstants.StatusUpdateCanceled}
      />
    </Card>
  );
};

export default OfferList;
