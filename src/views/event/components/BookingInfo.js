import React, { useState } from "react";
import { Card, Col, Form, Row, Typography, Input, Button, Tabs } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

const EventBookingInfo = ({ form }) => {
  const [activeTab, setActiveTab] = useState("0");

  const handleTabEdit = (targetKey, action) => {
    if (action === "add") {
      addNewSection();
    } else if (action === "remove") {
      removeSection(targetKey);
    }
  };

  const addNewSection = () => {
    const additional_booking_info =
      form.getFieldValue("additional_booking_info") || [];
    const newKey = additional_booking_info.length.toString();
    const newSection = {
      sectionTitle: "",
      sectionItems: [],
    };

    form.setFieldsValue({
      additional_booking_info: [...additional_booking_info, newSection],
    });
    setActiveTab(newKey);
  };

  const removeSection = (targetKey) => {
    const additional_booking_info =
      form.getFieldValue("additional_booking_info") || [];
    const newSections = additional_booking_info.filter(
      (_, index) => index.toString() !== targetKey
    );

    form.setFieldsValue({
      additional_booking_info: newSections,
    });

    if (activeTab === targetKey) {
      const newActiveTab = newSections.length > 0 ? "0" : null;
      setActiveTab(newActiveTab);
    }
  };

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Event Information">
          <Form.List name="additional_booking_info">
            {(sectionFields, { add: addSection, remove: removeSection }) => {
              const tabItems = sectionFields.map(
                ({ key, name, ...restField }, index) => ({
                  key: index.toString(),
                  label: `Section ${index + 1}`,
                  children: (
                    <div key={key}>
                      {/* Section Title Field */}
                      <Form.Item
                        {...restField}
                        name={[name, "sectionTitle"]}
                        label="Section Title"
                        rules={[
                          {
                            required: true,
                            message: "Please enter section title",
                          },
                        ]}
                        style={{ marginBottom: 24 }}
                      >
                        <Input
                          placeholder="Enter section title (e.g., Services, Requirements, Equipment)"
                          size="large"
                        />
                      </Form.Item>

                      {/* Section Items */}
                      <Form.List name={[name, "sectionItems"]}>
                        {(itemFields, { add: addItem, remove: removeItem }) => (
                          <>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: 16,
                              }}
                            >
                              <Title level={5} style={{ margin: 0 }}>
                                Section Items
                              </Title>
                              <Button
                                type="dashed"
                                onClick={() => addItem()}
                                icon={<PlusOutlined />}
                                style={{ marginLeft: "auto" }}
                              >
                                Add Item
                              </Button>
                            </div>

                            <Row gutter={[16, 8]}>
                              {itemFields.map(
                                ({ key, name: itemName, ...itemRestField }) => (
                                  <Col xs={24} sm={12} key={key}>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        marginBottom: 8,
                                      }}
                                    >
                                      <Form.Item
                                        {...itemRestField}
                                        name={itemName}
                                        rules={[
                                          {
                                            required: true,
                                            message: "Please enter item value",
                                          },
                                        ]}
                                        style={{
                                          flex: 1,
                                          margin: 0,
                                          marginRight: 8,
                                        }}
                                      >
                                        <Input placeholder="Enter item value" />
                                      </Form.Item>
                                      <Button
                                        type="text"
                                        icon={<MinusCircleOutlined />}
                                        onClick={() => removeItem(itemName)}
                                        danger
                                        size="small"
                                      />
                                    </div>
                                  </Col>
                                )
                              )}
                            </Row>

                            {itemFields.length === 0 && (
                              <div
                                style={{
                                  textAlign: "center",
                                  padding: "24px",
                                  background: "#fafafa",
                                  border: "1px dashed #d9d9d9",
                                  borderRadius: "6px",
                                  marginTop: 8,
                                }}
                              >
                                <Text type="secondary">
                                  No items added. Click "Add Item" to add
                                  section items.
                                </Text>
                              </div>
                            )}
                          </>
                        )}
                      </Form.List>
                    </div>
                  ),
                })
              );

              return (
                <>
                  {sectionFields.length > 0 ? (
                    <Tabs
                      type="editable-card"
                      activeKey={activeTab}
                      onChange={setActiveTab}
                      onEdit={handleTabEdit}
                      items={tabItems}
                      style={{ marginBottom: 24 }}
                    />
                  ) : (
                    <div style={{ textAlign: "center", padding: "48px" }}>
                      <Text type="secondary" style={{ fontSize: "16px" }}>
                        No information sections created yet.
                      </Text>
                      <br />
                      <Button
                        type="primary"
                        onClick={() =>
                          addSection({ sectionTitle: "", sectionItems: [] })
                        }
                        icon={<PlusOutlined />}
                        style={{ marginTop: 16 }}
                      >
                        Create First Section
                      </Button>
                    </div>
                  )}
                </>
              );
            }}
          </Form.List>

          <Form.Item name="additional_booking_notes" label="Additional Notes">
            <Input.TextArea
              rows={4}
              placeholder="Enter any additional comments or special notes"
            />
          </Form.Item>
        </Card>
      </Col>
    </Row>
  );
};

export default EventBookingInfo;
