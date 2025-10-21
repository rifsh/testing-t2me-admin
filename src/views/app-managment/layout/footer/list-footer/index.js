import React, { useEffect } from "react";
import { Card, Table, Button, Menu, Row, Col, Collapse, Tooltip } from "antd";
import {
  EditOutlined,
  FormOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import Flex from "components/shared-components/Flex";
import { useDispatch, useSelector } from "react-redux";
import { Form } from "antd";
import { useNavigate } from "react-router-dom";

import { APP_PREFIX_PATH } from "configs/AppConfig";
import utils from "utils";
import { fetchFooterData } from "store/slices/footerSlice";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";

import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import usePaginationHook from "utils/hooks/usePaginationHandler";
import Utils from "utils";

const { Panel } = Collapse;

const FooterList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, footerData, message, pagination } = useSelector(
    (state) => state.footer
  );
  const [form] = Form.useForm();
  const handlePagination = usePaginationHook(fetchFooterData);

  useEffect(() => {
    dispatch(fetchFooterData());
  }, [dispatch]);

  console.log("FOOTER DATA", footerData);

  // const handlePagination = (page, size) => {
  //   // dispatch(fetchAllFooter({ page: page, size: size }));
  // };

  const dropdownMenu = (row) => (
    <Menu>
      <Menu.Item>
        <Flex
          alignItems="center"
          onClick={() =>
            navigate(`${APP_PREFIX_PATH}/app/management/layout/footer/edit`, {
              state: {
                footerId: row.key,
              },
            })
          }
        >
          <EditOutlined />
          <span className="ml-2">Edit Footer</span>
        </Flex>
      </Menu.Item>
    </Menu>
  );

  // Transform the API data into a country-wise list (dynamically based on API data)
  const transformFooterData = (data) => {
    if (!data) return [];

    const transformedData = [];
    const customerSupportEntries = data.customer_support
      ? Object.entries(data.customer_support)
      : [];
    const acceptedPaymentEntries = data.accepted_payment_methods
      ? Object.entries(data.accepted_payment_methods)
      : [];
    const contactUsEntries = data.contact_us
      ? Object.entries(data.contact_us)
      : [];
    const supportHoursEntries = data.support_hours
      ? Object.entries(data.support_hours)
      : [];

    // Get unique countries from all sections
    const uniqueCountries = new Set([
      ...customerSupportEntries.map(([country]) => country),
      ...acceptedPaymentEntries.map(([country]) => country),
      ...contactUsEntries.map(([country]) => country),
      ...supportHoursEntries.map(([country]) => country),
    ]);

    Array.from(uniqueCountries).forEach((country) => {
      const customerSupport = data.customer_support?.[country];
      const paymentMethods = data.accepted_payment_methods?.[country] || [];
      const contactUs = data.contact_us?.[country];
      const supportHours = data.support_hours?.[country];

      if (
        customerSupport ||
        paymentMethods.length > 0 ||
        contactUs ||
        supportHours
      ) {
        transformedData.push({
          key: country,
          country: country.toUpperCase(),
          footer_name: data.footer_text,
          app_logo: data.app_logo_url,
          description: data.platform_description,
          whatsapp_number: customerSupport?.whatsapp_contact || "N/A",
          ticket_hotline: customerSupport?.customer_support || {
            hotline_number: "N/A",
            availability: "N/A",
          },
          payment_logos: paymentMethods,
          contact_us: contactUs || {
            heading: "N/A",
            subheading: "N/A",
            whatsapp_support: { button_text: "N/A", is_enabled: false },
          },
          support_hours: supportHours || {
            days_available: "N/A",
            operating_hours: "N/A",
          },
        });
      }
    });

    return transformedData;
  };

  const tableColumns = [
    {
      title: "Country",
      dataIndex: "country",
      render: (country) => {
        if (!country) return <span>N/A</span>;
        const number = Utils.removeAllAfterLastUnderscore(country);
        if (number === null) return <span>{country}</span>;
        return <span>{number}</span>;
      },
      sorter: (a, b) => utils.antdTableObjectSorter(a, b, "country"),
    },
    {
      title: "Footer Name",
      dataIndex: "footer_name",
      render: (name) => <span>{name || "N/A"}</span>,
      sorter: (a, b) => utils.antdTableObjectSorter(a, b, "footer_name"),
    },
    {
      title: "Logo",
      dataIndex: "app_logo",
      render: (logo) =>
        logo ? <img src={logo} alt="Logo" style={{ width: 80 }} /> : "N/A",
    },
    {
      title: "Description",
      dataIndex: "description",
      render: (description) => <span>{description || "N/A"}</span>,
    },
    {
      title: "WhatsApp Number",
      dataIndex: "whatsapp_number",
      render: (whatsappNumber) => <span>{whatsappNumber || "N/A"}</span>,
    },
    {
      title: "Ticket Hotline",
      render: (row) => (
        <span>
          {row.ticket_hotline.hotline_number || "N/A"}{" "}
          {row.ticket_hotline.availability
            ? `(${row.ticket_hotline.availability})`
            : ""}
        </span>
      ),
    },
    {
      title: "Contact Us",
      render: (row) => (
        <Collapse defaultActiveKey={[]} accordion>
          <Panel header="Contact Us Details" key="contact-us">
            <p>
              <strong>Heading:</strong> {row.contact_us.heading}
            </p>
            <p>
              <strong>Subheading:</strong> {row.contact_us.subheading}
            </p>
            <p>
              <strong>WhatsApp Support:</strong>{" "}
              {row.contact_us.whatsapp_support?.is_enabled
                ? "Enabled"
                : "Disabled"}
              {row.contact_us.whatsapp_support?.button_text
                ? ` (${row.contact_us.whatsapp_support.button_text})`
                : ""}
            </p>
          </Panel>
        </Collapse>
      ),
    },
    {
      title: "Support Hours",
      render: (row) => (
        <span>
          {row.support_hours?.days_available || "N/A"}{" "}
          {row.support_hours?.operating_hours
            ? `(${row.support_hours.operating_hours})`
            : ""}
        </span>
      ),
    },
    {
      title: "Payment Logos",
      render: (row) => (
        <Collapse defaultActiveKey={[]} accordion>
          {row.payment_logos && row.payment_logos.length > 0 ? (
            row.payment_logos.map((logo, index) => (
              <Panel
                header={logo.method_name}
                key={index}
                extra={<span>{logo.method_name}</span>}
              >
                <img
                  key={logo.method_name}
                  src={logo.method_logo}
                  alt={logo.method_name}
                  style={{ width: 50, marginRight: 8 }}
                />
              </Panel>
            ))
          ) : (
            <Panel
              collapsible="disabled"
              header={"No payment logos available"}
            />
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

  const transformedData = transformFooterData(footerData);

  console.log(
    JSON.stringify(transformedData, null, 2),
    "THIS IS TRANSFORMED DATA"
  );

  return (
    <Card>
      <Row gutter={16} justify={"end"} style={{ marginBottom: 16 }}>
        {/* <SearchBarWithStatus fetchFunction={fetchAllFooter} /> */}
        <Col xs={24} sm={8} style={{ textAlign: "right" }}>
          <Button
            type="primary"
            icon={<FormOutlined />}
            onClick={() =>
              navigate(`${APP_PREFIX_PATH}/app/management/layout/footer/add`)
            }
          >
            Add Footer
          </Button>
        </Col>
      </Row>

      <div className="table-responsive">
        <Table
          columns={tableColumns}
          dataSource={transformedData}
          rowKey="key"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.size,
            total: pagination.total,
            onChange: (page, pageSize) => handlePagination(page, pageSize),
          }}
        />
      </div>

      <UpdateStatusModal
        responseMessage={message}
        pageData={{ page: 1, size: 10 }}
      />
    </Card>
  );
};

export default FooterList;
