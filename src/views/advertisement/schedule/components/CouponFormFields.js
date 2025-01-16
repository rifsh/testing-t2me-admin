import React, { useEffect, useState } from "react";
import { Input, Row, Col, Card, Form, Select, DatePicker, Upload, Button, message } from "antd";
import moment from "moment";
import { UploadOutlined, InboxOutlined,FileImageOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";

const { Option } = Select;
const { Dragger } = Upload;

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
  const [fileList, setFileList] = useState([]);
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

  const uploadProps = {
    name: 'file',
    multiple: false,
    action: 'your-upload-endpoint',
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    beforeUpload(file) {
      const isValidFileType = file.type === 'application/pdf' || file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isValidFileType) {
        message.error('You can only upload PDF, JPEG, or PNG files!');
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('File must be smaller than 2MB!');
      }
      return isValidFileType && isLt2M;
    }
  };

  const onDragStart = (e, file) => {
    e.dataTransfer.setData('fileData', JSON.stringify(file));
  };

  const onDrop = (e) => {
    e.preventDefault();
    try {
      const fileData = JSON.parse(e.dataTransfer.getData('fileData'));
      form.setFieldsValue({
        file: [fileData]
      });
      message.success(`${fileData.name} selected successfully`);
    } catch (error) {
      message.error('Failed to select file');
    }
  };

  return (
    <Row gutter={16}>
      <Col xs={24} sm={29} md={11}>
        <Card title="File Gallery" className="h-full">
          <div className="file-gallery" style={{ minHeight: '400px' }}>
            {fileList.map(file => (
              <div
                key={file.uid}
                draggable
                onDragStart={(e) => onDragStart(e, file)}
                className="file-item p-2 mb-2 border rounded cursor-move hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <FileImageOutlined className="mr-2" />
                  <span className="text-sm">{file.name}</span>
                </div>
                {file.thumbUrl && (
                  <img
                    src={file.thumbUrl}
                    alt={file.name}
                    className="mt-2 w-full h-20 object-cover rounded"
                  />
                )}
              </div>
            ))}
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={24} md={13}>
        <Card title="Coupon Details">
          <Form.Item
            name="name"
            label="Schedule Name"
            rules={rules.name}
          >
            <Input placeholder="Enter Schedule Name" />
          </Form.Item>
          <Form.Item
            name="file"
            label="Upload File"
            rules={rules.file}
            valuePropName="fileList"
            getValueFromEvent={e => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
          >
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">
                Support for PDF, JPEG, or PNG files. File size should be less than 2MB.
              </p>
            </Dragger>
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

        </Card>
      </Col>
    </Row>
  );
}

export default CouponFormFields;