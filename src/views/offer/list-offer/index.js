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
        title="Offer Details"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        {selectedOffer && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Offer Name">
              {selectedOffer.name}
            </Descriptions.Item>
            <Descriptions.Item label="Discount Percentage">
              {selectedOffer.discount_percentage}%
            </Descriptions.Item>
            <Descriptions.Item label="Start Date">
              {selectedOffer.start_date
                ? new Date(selectedOffer.start_date).toLocaleDateString()
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="End Date">
              {selectedOffer.end_date
                ? new Date(selectedOffer.end_date).toLocaleDateString()
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Max Users">
              {selectedOffer.max_uses}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {selectedOffer.status ? "Active" : "Inactive"}
            </Descriptions.Item>
            <Descriptions.Item label="Keywords">
              {selectedOffer.key_words && selectedOffer.key_words.length
                ? selectedOffer.key_words.join(", ")
                : "None"}
            </Descriptions.Item>
            {/* <Descriptions.Item label="Offer Description">
            {selectedOffer.description || "No description available"}
            </Descriptions.Item> */}
            {selectedOffer.thumbnail_image &&
              selectedOffer.thumbnail_image !== "images" ? (
              <Descriptions.Item label="Thumbnail Image">
                {/* <img
                  src={selectedOffer.thumbnail_image}
                  alt="Offer Thumbnail"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    objectFit: "contain",
                  }}
                /> */}
                <CDNImage
                  src={selectedOffer.thumbnail_image}
                  alt={`Image Thumbnail`}
                  height={100}
                  width={80}
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
