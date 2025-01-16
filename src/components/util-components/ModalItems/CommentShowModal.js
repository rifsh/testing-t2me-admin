import React, { useState } from "react";
import { Modal, Button, Typography, Input, Space } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

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
  setComment
}) => {
//   const [comment, setComment] = useState("");
    // console.log(comment,'.......')
  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(comment);
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
        <Text type="secondary" style={{ color: "#fa541c" }}>
          {warningMessage}
        </Text>
      </Space>
    </Modal>
  );
};

export default CommentShowModal;
