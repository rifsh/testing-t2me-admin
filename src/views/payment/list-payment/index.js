import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Table,
  Menu,
  Collapse,
  Dropdown,
  Modal,
  Descriptions,
  Tag,
} from "antd";
import {
  FormOutlined,
  EditOutlined,
  EyeOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import Flex from "components/shared-components/Flex";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import { fetchAllPayment } from "store/slices/paymentSlice";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import Utils from "utils";
import usePaginationHook from "utils/hooks/usePaginationHandler";
import usePermissions from "utils/hooks/usePermissions";
import { PERMISSIONS } from "constants/RolesPermissionConstants";
import CDNImage from "components/layout-components/Image/CDNImage";
const { Panel } = Collapse;

const PaymentList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, payments, pagination } = useSelector(
    (state) => state.payment
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const handlePagination = usePaginationHook(fetchAllPayment);
  const { hasPermission, hasAnyPermission } = usePermissions();

  useEffect(() => {
    dispatch(fetchAllPayment(DEFAULT_PAGE_SIZE));
  }, [dispatch]);

  const showModal = (payment) => {
    setSelectedPayment(payment);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedPayment(null);
  };

  // const handlePagination = (page, size) => {
  //   dispatch(fetchAllPayment({ page, size }));
  // };

  const dropdownMenu = (row) => [
    {
      key: "view",
      label: hasPermission(
        PERMISSIONS.APPLICATIONS.SERVICES.GENERAL.PAYMENT.GET_PAYMENT_DETAILS
      ) ? (
        <Flex alignItems="center">
          <EyeOutlined />
          <span className="ml-2">View Details</span>
        </Flex>
      ) : null,
      onClick: () => {
        navigate(`${APP_PREFIX_PATH}/payment/details/${row.id}`);
      },
    },
    {
      key: "remark",
      label: hasPermission(
        PERMISSIONS.APPLICATIONS.SERVICES.GENERAL.PAYMENT.EDIT_PAYMENT
      ) ? (
        <Flex alignItems="center">
          <EditOutlined />
          <span className="ml-2">Edit Payment</span>
        </Flex>
      ) : null,
      onClick: () => navigate(`${APP_PREFIX_PATH}/payment/edit/${row.id}`),
    },
  ];

  const tableColumns = [
    {
      title: "Place",
      render: (row) => (
        <div>
          {/* <img
            src={row.place?.thumbnail_image}
            alt={row.place?.name}
            style={{
              width: 50,
              height: 50,
              marginRight: 10,
              objectFit: "cover",
            }}
          /> */}
          <CDNImage
            src={row.place?.thumbnail_image}
            alt={`Image Thumbnail`}
            height={50}
            width={80}
          />
          <span>{row.place?.name || "N/A"}</span>
        </div>
      ),
    },
    {
      title: "Event",
      render: (row) => (
        <div>
          {/* <img
            src={row.event?.thumbnail_image}
            alt={row.event?.event_name}
            style={{
              width: 50,
              height: 50,
              marginRight: 10,
              objectFit: "cover",
            }}
          /> */}
          <CDNImage
            src={row.event?.thumbnail_image}
            alt={`Image Thumbnail`}
            height={50}
            width={80}
          />
          <span>{row.event?.event_name || "N/A"}</span>
        </div>
      ),
    },
    {
      title: "Country",
      render: (row) => <span>{row.place?.country?.name || "N/A"}</span>,
    },
    {
      title: "Status",
      render: (row) => (
        <Tag color={row.status ? "green" : "red"}>
          {row.status ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (_, row) =>
        hasAnyPermission([
          PERMISSIONS.APPLICATIONS.SERVICES.GENERAL.PAYMENT.EDIT_PAYMENT,
          PERMISSIONS.APPLICATIONS.SERVICES.GENERAL.PAYMENT.GET_PAYMENT_DETAILS,
        ]) ? (
          <Dropdown menu={{ items: dropdownMenu(row) }} trigger={["click"]}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        ) : null,
    },
  ];

  return (
    <Card>
      <Flex alignItems="center" justifyContent="space-between" className="mb-4">
        <SearchBarWithStatus fetchFunction={fetchAllPayment} />
        {hasPermission(
          PERMISSIONS.APPLICATIONS.SERVICES.GENERAL.PAYMENT.ADD_PAYMENT
        ) && (
          <Button
            type="primary"
            icon={<FormOutlined />}
            onClick={() => navigate(`${APP_PREFIX_PATH}/payment/add`)}
          >
            Add Payment
          </Button>
        )}
      </Flex>
      <div className="table-responsive">
        <Table
          columns={tableColumns}
          dataSource={payments}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination?.page || 1,
            pageSize: pagination?.size || 10,
            total: pagination?.total || 0,
            onChange: handlePagination,
          }}
        />
      </div>
      <Modal
        title="Payment Details"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        {selectedPayment && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Place">
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  src={selectedPayment.place?.thumbnail_image}
                  alt={selectedPayment.place?.name}
                  style={{
                    width: 50,
                    height: 50,
                    marginRight: 10,
                    objectFit: "cover",
                  }}
                />
                {selectedPayment.place?.name || "N/A"}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Country">
              {selectedPayment.place?.country?.name || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Event">
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  src={selectedPayment.event?.thumbnail_image}
                  alt={selectedPayment.event?.event_name}
                  style={{
                    width: 50,
                    height: 50,
                    marginRight: 10,
                    objectFit: "cover",
                  }}
                />
                {selectedPayment.event?.event_name || "N/A"}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Event Description">
              {selectedPayment.event?.description || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={selectedPayment.status ? "green" : "red"}>
                {selectedPayment.status ? "Active" : "Inactive"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Terms & Conditions">
              {selectedPayment.terms_and_conditions || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Additional URLs">
              {selectedPayment.additional_urls || "N/A"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Card>
  );
};

export default PaymentList;
