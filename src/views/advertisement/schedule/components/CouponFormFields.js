import React from "react";
import { Input, Row, Col, Card, Form, Select,DatePicker,Upload,Button } from "antd";
import moment from "moment";
import { UploadOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";

const { Option } = Select;

const rules = {
  country: [
    {
      required: true,
      message: "Please Choose a country",
    },
  ],
  name: [
    {
      required: true,
      message: "Please enter country name",
    },
  ],
  description: [
    {
      required: true,
      message: "Please enter country description",
    },
  ],
  price: [
    {
      required: true,
      message: "Please enter country price",
    },
  ],
  comparePrice: [],
  taxRate: [
    {
      required: true,
      message: "Please enter tax rate",
    },
  ],
  cost: [
    {
      required: true,
      message: "Please enter item cost",
    },
  ],
  startDate: [
    {
      required: true,
      message: "Please select the start date",
    }
  ],
  endDate: [
    {
      required: true,
      message: "Please select the end date",
    }
  ]
};

function CouponFormFields(props) {
  const [form] = Form.useForm();
  const startDate = Form.useWatch('start_date', form);
  const dispatch = useDispatch();
  const { loading, countries, error } = useSelector((state) => state.locations);

  const disablePastDates = (current) => {
    return current && current < moment().startOf('day');
  };

  const disableEndDate = (current) => {
    if (!startDate) {
      return false;
    }
    return current && current < moment(startDate).startOf('day');
  };

  const handleStartDateChange = () => {
    form.setFieldValue('end_date', null);
  };
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Coupon Details">
          <Form.Item
            name="name"
            label="Schedule Name"
            rules={rules.name}
          >
            <Input placeholder="Enter Schedule Name" />
          </Form.Item>
          <Form.Item
              name="banner_image"
              label="Banner Media"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              rules={rules.thumbnail_image}
            >
            <Upload name="thumbnail_image" listType="picture" maxCount={1} beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Click to upload</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            name="banner_url"
            label="Banner Redirect Url"
            rules={rules.name}
          >
            <Input placeholder="Enter banner url" />
          </Form.Item>
          <Form.Item
            name="start_date"
            label="Start Date"
            rules={rules.startDate}
          >
            <DatePicker
              className="w-100"
              placeholder="Select start date"
              format="YYYY-MM-DD"
              disabledDate={disablePastDates}
              onChange={handleStartDateChange}
              showToday={false}
            />
          </Form.Item>

          <Form.Item 
            name="end_date" 
            label="End Date" 
            rules={[
              ...rules.endDate,
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startDate = getFieldValue('start_date');
                  if (!startDate || !value) {
                    return Promise.resolve();
                  }
                  if (value.isBefore(startDate, 'day')) {
                    return Promise.reject(new Error('End date must be after start date'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker
              className="w-100"
              placeholder="Select end date"
              format="YYYY-MM-DD"
              disabledDate={disableEndDate}
              showToday={false}
            />
          </Form.Item>


          <Form.Item 
            name="duration" 
            label="Duration" 
            rules={[
              {
                required: true,
                message: "Please enter banner duration",
              },
              {
                type: 'number',
                transform: (value) => Number(value),
                min: 1,
                message: "Maximum Duration must be at least 1",
              }
            ]}
          >
            <Input type="number" placeholder="Enter banner duration" />
          </Form.Item>
          <Form.Item name="country_id" label="Category" rules={rules.country}>
            <Select className="w-100" placeholder="Choose a Category" loading={loading}>
              {countries && countries.length > 0 ? (
                countries.map((country) => (
                  <Option key={country.id} value={country.id}>
                    {country.country}
                  </Option>
                ))
              ) : (
                <Option disabled>No category available</Option>
              )}
            </Select>
          </Form.Item>
          <Form.Item name="country_id" label="Place" rules={rules.country}>
            <Select className="w-100" placeholder="Choose a Place" loading={loading}>
              {countries && countries.length > 0 ? (
                countries.map((country) => (
                  <Option key={country.id} value={country.id}>
                    {country.country}
                  </Option>
                ))
              ) : (
                <Option disabled>No Place available</Option>
              )}
            </Select>
          </Form.Item>
          <Form.Item name="country_id" label="Event" rules={rules.country}>
            <Select className="w-100" placeholder="Choose a Event" loading={loading}>
              {countries && countries.length > 0 ? (
                countries.map((country) => (
                  <Option key={country.id} value={country.id}>
                    {country.country}
                  </Option>
                ))
              ) : (
                <Option disabled>No Event available</Option>
              )}
            </Select>
          </Form.Item>
        </Card>
      </Col>
    </Row>
  );
}

export default CouponFormFields;