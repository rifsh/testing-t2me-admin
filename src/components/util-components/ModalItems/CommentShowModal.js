import React, { useState } from "react";
import { Modal, Button, Typography, Input, Space, Upload, message } from "antd";
import { ExclamationCircleOutlined, UploadOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Title, Text } = Typography;

const CommentShowModal = ({
  visible,
  title = "Add Comment",
  placeholder = "Type your comment here...",
  warningMessage = "Please provide your comment before submitting",
  onSubmit,
  onCancel,
  submitText = "Submit",
  cancelText = "Cancel",
  loading = false,
  comment,
  setComment,
  showFileUpload = false, // New prop to toggle file upload
  onFileChange, // Callback for handling file changes
  maxFileSize = 5 // Max file size in MB
}) => {
  const [fileList, setFileList] = useState([]);

  const handleFileChange = ({ file, fileList }) => {
    if (file.size / 1024 / 1024 > maxFileSize) {
      message.error(`File must be smaller than ${maxFileSize}MB!`);
      return;
    }
    setFileList(fileList);
    if (onFileChange) {
      onFileChange(fileList); // Pass the updated file list to the parent
    }
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(comment, fileList); // Pass the comment and file list on submit
    }
  };

  return (
    <Modal
      open={visible}
      width={500}
      title={
        <Space align="center">
          <ExclamationCircleOutlined style={{ color: "#faad14" }} />
          <span>{title}</span>
        </Space>
      }
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {cancelText}
        </Button>,
        <Button
          key="submit"
          type="primary"
          danger
          loading={loading}
          onClick={handleSubmit}
          disabled={!comment.trim()} // Disable the button if no comment
        >
          {submitText}
        </Button>,
      ]}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <TextArea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={placeholder}
          rows={4}
        />
        {showFileUpload && (
          <Upload
            fileList={fileList}
            onChange={handleFileChange}
            beforeUpload={() => false} // Prevent automatic upload
          >
            <Button icon={<UploadOutlined />}>Upload File</Button>
          </Upload>
        )}
        <Text type="secondary" style={{ color: "#fa541c" }}>
          {warningMessage}
        </Text>
      </Space>
    </Modal>
  );
};

export default CommentShowModal;
