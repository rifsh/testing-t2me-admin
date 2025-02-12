import React, { useEffect, useState } from "react";
import { Card, Button, Table, Menu, Collapse, Dropdown, Modal, Descriptions, Tag } from 'antd';
import { FormOutlined, EditOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons';
import Flex from "components/shared-components/Flex";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import { fetchAllPayment } from "store/slices/paymentSlice";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import Utils from "utils";
const { Panel } = Collapse;

const PaymentList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, payments, pagination } = useSelector(
    (state) => state.payment
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    // Fixed: Pass an object with size property
    dispatch(fetchAllPayment({ size: DEFAULT_PAGE_SIZE, page: 1 }));
  }, [dispatch]);

  const showModal = (offer) => {
    setSelectedPayment(offer);
    setIsModalVisible(true);
  };
  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedPayment(null);
  };

  const handlePagination = (page, size) => {
    dispatch(fetchAllPayment({ page, size }));
  };

  const dropdownMenu = (row) => [
    {
      key: "view",
      label: (
        <Flex alignItems="center">
          <EyeOutlined />
          <span className="ml-2">View Details</span>
        </Flex>
      ),
      onClick: () => navigate(`${APP_PREFIX_PATH}/payment/details/${row.id}`), 
        //showModal(row),
    },
    {
      key: "remark",
      label: (
        <Flex alignItems="center">
          <EditOutlined />
          <span className="ml-2">Edit Offer</span>
        </Flex>
      ),
      //onClick: () => handleEditTax(row.id),
    },
  ];

  const tableColumns = [
    {
      title: "Place",
      dataIndex: ["jsonData", "place_name"],
      render: (name) => <span>{name || "N/A"}</span>,
      sorter: (a, b) => Utils.antdTableSorter(a, b, ["jsonData", "place_name"])
    },
    {
      title: "Event",
      dataIndex: ["jsonData", "event"],
      render: (event) => <span>{event || "N/A"}</span>
    },
    {
      title: "Add on Services",
      render: (row) => (
        <Collapse defaultActiveKey={[]} accordion>
          {row.jsonData?.service_adons && row.jsonData.service_adons.length > 0 ? (
            row.jsonData.service_adons.map((logo, index) => (
              <Panel
                header={logo.name}
                key={index}
                extra={<span>{logo.type}</span>}
              >
                <img
                  key={logo.name}
                  src={logo.logo}
                  alt={logo.name}
                  style={{ width: 50, marginRight: 8 }}
                />
              </Panel>
            ))
          ) : (
            <Panel collapsible="disabled" header="" />
          )}
        </Collapse>
      ),
    },
    {
      title: "Payments",
      render: (row) => (
        <Collapse defaultActiveKey={[]} accordion>
          {row.jsonData?.payment_logos && row.jsonData.payment_logos.length > 0 ? (
            row.jsonData.payment_logos.map((logo, index) => (
              <Panel
                header={logo.name}
                key={index}
                extra={<span>{logo.type}</span>}
              >
                <img
                  key={logo.name}
                  src={logo.logo}
                  alt={logo.name}
                  style={{ width: 50, marginRight: 8 }}
                />
              </Panel>
            ))
          ) : (
            <Panel collapsible="disabled" header="No payment logos available" />
          )}
        </Collapse>
      ),
    },
    {
      title: "",
      dataIndex: "actions",
      render: (_, row) => (
        <Dropdown menu={{ items: dropdownMenu(row) }} trigger={["click"]}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <Card>
      <Flex alignItems="center" justifyContent="space-between" className="mb-4">
        <SearchBarWithStatus fetchFunction={fetchAllPayment} />
        <Button
          type="primary"
          icon={<FormOutlined />}
        >
          Add Payment
        </Button>
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
        title="Payment Method Details"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        {selectedPayment && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Place Name">
              {selectedPayment.jsonData?.place_name || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Event Name">
              {selectedPayment.jsonData?.event || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Add on Services">
              {selectedPayment.jsonData?.service_adons?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedPayment.jsonData.service_adons.map((service, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={service.logo}
                        alt={service.name}
                        style={{ width: 50, height: 50, objectFit: 'contain' }}
                      />
                      <div>
                        <div><strong>{service.name}</strong></div>
                        {service.type && <Tag color="blue">{service.type}</Tag>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                'No add-on services available'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Payments">
              {selectedPayment.jsonData?.payment_logos?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedPayment.jsonData.payment_logos.map((payment, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={payment.logo}
                        alt={payment.name}
                        style={{ width: 50, height: 50, objectFit: 'contain' }}
                      />
                      <div>
                        <div><strong>{payment.name}</strong></div>
                        {payment.type && <Tag color="green">{payment.type}</Tag>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                'No payment methods available'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Url Terms & Conditions">
              {/* {selectedOffer.max_uses} */}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Card>
  );
};

export default PaymentList;