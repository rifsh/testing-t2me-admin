import React, { useState, useEffect } from "react";
import { Tabs, Form, Button, message } from "antd";
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import Flex from "components/shared-components/Flex";
import TicketFormFields from "../components/TicketFormFields";
import ProductListData from "assets/data/product-list.data.json";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import DraftSystem from "drafts/components/DraftSystem";

const ADD = "ADD";
const EDIT = "EDIT";

const TicketForm = (props) => {
  const { mode, param } = props;

  const [form] = Form.useForm();
  const [uploadedImg, setImage] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const onFinish = () => {
    setSubmitLoading(true);
    form
      .validateFields()
      .then((values) => {
        const formData = {
          venue_id: values.venue,
          base_price: values.basePrice,
          number_of_tickets: values.numberOfTickets,
          ticket_types: values.ticketTypes,
        };

        setTimeout(() => {
          setSubmitLoading(false);
          if (mode === ADD) {
            message.success(`Created event with venue ${formData.venue_id}`);
          }
          if (mode === EDIT) {
            message.success("Event updated successfully");
          }
        }, 1500);
      })
      .catch((info) => {
        setSubmitLoading(false);
        console.log("info", info);
        message.error("Please enter all required fields");
      });
  };

  return (
    <>
      <Form
        layout="vertical"
        form={form}
        name="ticket_form"
        className="ant-advanced-search-form"
        initialValues={{
          heightUnit: "cm",
          widthUnit: "cm",
          weightUnit: "kg",
        }}
      >
        <PageHeaderAlt className="border-bottom" overlap>
          <div className="container">
            <Flex
              className="py-2"
              mobileFlex={false}
              justifyContent="space-between"
              alignItems="center"
            >
              <h2 className="mb-3">
                {mode === "ADD" ? "Add New Event" : `Edit Event`}
              </h2>
              <div className="mb-3">
                {" "}
                
                <DiscardButton form={form} />
                <Button
                  type="primary"
                  onClick={() => onFinish()}
                  htmlType="submit"
                  loading={submitLoading}
                >
                  {mode === "ADD" ? "Add" : `Save`}
                </Button>
              </div>
            </Flex>
          </div>
        </PageHeaderAlt>
        <div className="container">
          <Tabs
            defaultActiveKey="1"
            style={{ marginTop: 30 }}
            items={[
              {
                label: "General",
                key: "1",
                children: <TicketFormFields form={form} />,
              },
            ]}
          />
        </div>
      </Form>
    </>
  );
};

export default TicketForm;
