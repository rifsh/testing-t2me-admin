import React, { useEffect } from "react";
import { Input, Row, Col, Card, Form, Select, Spin, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { fetchAllCountires } from "store/slices/locationSlice";
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
  // thumbnail_image: [
  //   {
  //     required: true,
  //     message: "Please upload a thumbnail image",
  //   },
  // ],
  // banner_images: [
  //   {
  //     required: true,
  //     message: "Please upload banner images",
  //   },
  // ],
};

const CountryFormFields = (props) => {
  const dispatch = useDispatch();
  const { loading, countries, error } = useSelector((state) => state.locations);

  useEffect(() => {
    if (countries.length === 0) {
      dispatch(fetchAllCountires());
    }
  }, [dispatch, countries]);

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  if (loading) {
    return (
      <Row justify="center" align="middle" style={{ minHeight: "200px" }}>
        <Spin size="large" />
      </Row>
    );
  }

  if (error) {
    return (
      <Row>
        <Col span={24}>
          <div style={{ color: "red", textAlign: "center" }}>
            {error || "Failed to load countries"}
          </div>
        </Col>
      </Row>
    );
  }

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Basic Info">
          <Form.Item name="country_id" label="Country name" rules={rules.country}>
            <Select className="w-100" placeholder="Choose a Country" loading={loading}>
              {countries && countries.length > 0 ? (
                countries.map((country) => (
                  <Option key={country.id} value={country.id}>
                    {country.country}
                  </Option>
                ))
              ) : (
                <Option disabled>No countries available</Option>
              )}
            </Select>
          </Form.Item>
          <Form.Item name="name" label="Place" rules={rules.name}>
            <Input placeholder="Place Name" />
          </Form.Item>
          <Form.Item
            name="thumbnail_image"
            label="Thumbnail Image"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={rules.thumbnail_image}
          >
            <Upload name="thumbnail_image" listType="picture" maxCount={1} beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Click to upload</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            name="banner_images"
            label="Banner Images"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={rules.banner_images}
          >
            <Upload name="banner_images" listType="picture" multiple beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Click to upload banners</Button>
            </Upload>
          </Form.Item>

        </Card>
      </Col>
    </Row>
  );
};

export default CountryFormFields;
