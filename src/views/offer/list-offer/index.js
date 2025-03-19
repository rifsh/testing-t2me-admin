import React, { useEffect, useState } from "react";
import { Card, Table, Button, Modal, Descriptions, Dropdown } from "antd";
import {
  EyeOutlined,
  FormOutlined,
  MoreOutlined,
  EditOutlined,
} from "@ant-design/icons";
import Flex from "components/shared-components/Flex";
import { useNavigate } from "react-router-dom";
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

const OfferList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
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

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

  useEffect(() => {
    dispatch(fetchAllOffers(DEFAULT_PAGE_SIZE));
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
    navigate(`${APP_PREFIX_PATH}/offer/edit/${editItemId}`);
    console.log(editItemId, "9234239423490823498234098234908");
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
          <span className="ml-2">Edit Offer</span>
        </Flex>
      ),
      onClick: () => handleEditTax(row.id),
    },
  ];

  const tableColumns = [
    {
      title: "Offer Name",
      dataIndex: "name",
      sorter: (a, b) => Utils.antdTableSorter(a, b, "name"),
    },
    {
      title: "Discount Percentage",
      dataIndex: "discount_percentage",
      sorter: (a, b) => a.discount_percentage - b.discount_percentage,
    },
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
  const handlePagination = (page, size) => {
    dispatch(fetchAllOffers({ page: page, size: size }));
  };

  return (
    <Card>
      <Flex alignItems="center" className="mb-3" justifyContent="space-between">
        <SearchBarWithStatus fetchFunction={fetchAllOffers} />
        <Button
          type="primary"
          icon={<FormOutlined />}
          onClick={() => navigate(`${APP_PREFIX_PATH}/offer/add`)}
        >
          Add Offer
        </Button>
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
                <img
                  src={selectedOffer.thumbnail_image}
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
