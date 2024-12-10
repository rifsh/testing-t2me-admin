import React from "react";
import { Input, Row, Col, Card, Form, DatePicker, Checkbox, Button, Space } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { setIsDateRequired } from "store/slices/offerSlice";

const rules = {
  name: [
    {
      required: true,
      message: "Please enter the offer name",
    },
  ],
  discountPercentage: [
    {
      required: true,
      message: "Please enter the discount percentage",
    },
  ],
  maxUsers: [
    {
      required: true,
      message: "Please enter the maximum number of users",
    },
  ],
  endDate: [
    {
      required: true,
      message: "Please select the end date",
    },
  ],
  startDate: [
    {
      required: true,
      message: "Please select the start date",
    },
  ],
};

function OfferFormFields(props) {
  const dispatch = useDispatch();
  const { isDateRequired } = useSelector((state) => state.offers);

  const handleRequiredChanges = (e) => {
    dispatch(setIsDateRequired(e.target.checked));
  };

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Offer Details">
          <Form.Item name="name" label="Offer Name" rules={rules.name}>
            <Input placeholder="Enter offer name" />
          </Form.Item>
          <Form.Item
            name="discount_percentage"
            label="Discount Percentage (%)"
            rules={rules.discountPercentage}
          >
            <Input placeholder="Enter discount percentage" />
          </Form.Item>
          <Form.Item
            name="max_uses"
            label="Maximum Uses"
            rules={rules.maxUsers}
          >
            <Input type="number" placeholder="Enter maximum uses" />
          </Form.Item>
          <Form.Item
            name="date_required"
            label="Is Date Required?"
            valuePropName="checked"
          >
            <Checkbox checked={isDateRequired} onChange={handleRequiredChanges}>
              Date Required
            </Checkbox>
          </Form.Item>

          {isDateRequired && (
            <>
              <Form.Item
                name="start_date"
                label="Start Date"
                rules={rules.startDate}
              >
                <DatePicker
                  className="w-100"
                  placeholder="Select start date"
                  format="YYYY-MM-DD"
                />
              </Form.Item>
              <Form.Item name="end_date" label="End Date" rules={rules.endDate}>
                <DatePicker
                  className="w-100"
                  placeholder="Select end date"
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </>
          )}

          <Form.List name="key_words">
            {(fields, { add, remove }) => (
              <>
                <label>Key Words</label>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={name}
                      fieldId={fieldKey}
                      rules={[
                        {
                          required: true,
                          message: "Please enter a keyword",
                        },
                      ]}
                    >
                      <Input placeholder="Enter keyword" />
                    </Form.Item>
                    <Button
                      type="link"
                      danger
                      onClick={() => remove(name)}
                    >
                      Remove
                    </Button>
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block>
                  Add Keyword
                </Button>
              </>
            )}
          </Form.List>
        </Card>
      </Col>
    </Row>
  );
}

export default OfferFormFields;
