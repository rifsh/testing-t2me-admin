import React, { useEffect } from "react";
import { Card, Table, Button, Menu, Row, Col, Collapse } from "antd";
import { EditOutlined, FormOutlined } from "@ant-design/icons";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import Flex from "components/shared-components/Flex";
import { useDispatch, useSelector } from "react-redux";
import { Form } from "antd";
import { useNavigate } from "react-router-dom";

import { APP_PREFIX_PATH } from "configs/AppConfig";
import utils from "utils";
import { fetchAllFooter } from "store/slices/layoutSlice";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";

import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";

const { Panel } = Collapse;

const FooterList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, footers, message, pagination } = useSelector(
    (state) => state.layout
  );
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchAllFooter(DEFAULT_PAGE_SIZE));
  }, [dispatch]);




  const handlePagination = (page, size) => {
    dispatch(fetchAllFooter({ page: page, size: size }));
  };

  const dropdownMenu = (row) => (
    <Menu>
      <Menu.Item>
        <Flex alignItems="center" >
          <EditOutlined />
          <span className="ml-2">Edit Footer</span>
        </Flex>
      </Menu.Item>
    </Menu>
  );

  const tableColumns = [
    {
      title: "Footer Name",
      dataIndex: ["jsonData", "footer_name"],
      render: (name) => <span>{name || "N/A"}</span>,
      sorter: (a, b) =>
        utils.antdTableObjectSorter(a, b, ["jsonData", "footer_name"]),
    },
    {
      title: "Logo",
      dataIndex: ["jsonData", "app_logo"],
      render: (logo) => <img src={logo} alt="Logo" style={{ width: 80 }} />,
    },
    {
      title: "Description",
      dataIndex: ["jsonData", "description"],
      render: (description) => <span>{description || "N/A"}</span>,
    },
    {
      title: "WhatsApp Number",
      dataIndex: ["jsonData", "whatsapp_number"],
      render: (whatsappNumber) => <span>{whatsappNumber || "N/A"}</span>,
    },
    {
      title: "Ticket Hotline",
      render: (row) => (
        <span>
          {row.jsonData.ticket_hotline.phone_number} ({row.jsonData.ticket_hotline.available_from} to {row.jsonData.ticket_hotline.available_until})
        </span>
      ),
    },
    {
      title: "Payment Logos",
      render: (row) => (
        <Collapse defaultActiveKey={[]} accordion>
          {row.jsonData.payment_logos && row.jsonData.payment_logos.length > 0 ? (
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
            <Panel collapsible="disabled" header={"No payment logos available"} />
          )}
        </Collapse>
      ),
    },
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
        <SearchBarWithStatus fetchFunction={fetchAllFooter} />
        <Col xs={24} sm={8} style={{ textAlign: "right" }}>
          <Button
            type="primary"
            icon={<FormOutlined />}
            onClick={() => navigate(`${APP_PREFIX_PATH}/app/management/layout/footer/add`)}
          >
            Add Venue
          </Button>
        </Col>
      </Row>

      <div className="table-responsive">
        <Table
          columns={tableColumns}
          dataSource={footers}
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

      <UpdateStatusModal responseMessage={message} pageData={{ page: 1, size: 10 }} />
    </Card>
  );
};

export default FooterList;
