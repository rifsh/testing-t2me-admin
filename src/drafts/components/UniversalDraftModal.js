// UniversalDraftModal.js
import React, { useState } from "react";
import {
  Modal,
  List,
  Typography,
  Space,
  Tag,
  Tooltip,
  Button,
  Popconfirm,
  Input,
} from "antd";
import {
  FileTextOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const UniversalDraftModal = ({
  visible,
  onClose,
  drafts,
  onLoadDraft,
  onDeleteDraft,
  onClearAll,
  formType,
  allowBulkActions = true,
}) => {
  const [editingTitle, setEditingTitle] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  const getDraftPreview = (draft) => {
    const { metadata, formValues } = draft;
    const tags = [];
    if (metadata?.hasFiles)
      tags.push(
        <Tag key="files" color="blue">
          Has Files
        </Tag>
      );
    if (metadata?.fieldCount)
      tags.push(
        <Tag key="fields" color="green">
          {metadata.fieldCount} Fields
        </Tag>
      );
    if (draft.category)
      tags.push(
        <Tag key="category" color="orange">
          {draft.category}
        </Tag>
      );
    if (metadata?.mode === "EDIT")
      tags.push(
        <Tag key="mode" color="red">
          Edit Mode
        </Tag>
      );
    return <Space>{tags}</Space>;
  };

  const getDraftDescription = (draft) => {
    const { formValues } = draft;
    const descFields = [
      "description",
      "content",
      "summary",
      "details",
      "notes",
    ];
    const descField = descFields.find((field) => formValues[field]);

    if (descField && formValues[descField]) {
      const desc =
        typeof formValues[descField] === "string"
          ? formValues[descField]
          : JSON.stringify(formValues[descField]);
      return desc.replace(/<[^>]*>/g, "").substring(0, 100) + "...";
    }
    return `${Object.keys(formValues).length} form fields saved`;
  };

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined />
          {`${formType.toUpperCase()} Drafts`}
          <Tag>{drafts.length}</Tag>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={700}
      footer={
        allowBulkActions && drafts.length > 0 ? (
          <Space>
            <Popconfirm
              title={`Delete all ${drafts.length} drafts?`}
              onConfirm={() => {
                onClearAll();
                onClose();
              }}
              okText="Yes, Delete All"
              cancelText="Cancel"
            >
              <Button danger>Clear All Drafts</Button>
            </Popconfirm>
          </Space>
        ) : null
      }
    >
      {drafts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <FileTextOutlined style={{ fontSize: "48px", color: "#d9d9d9" }} />
          <p style={{ marginTop: "16px", color: "#999" }}>
            No {formType} drafts available
          </p>
        </div>
      ) : (
        <List
          dataSource={drafts}
          renderItem={(draft) => (
            <List.Item
              actions={[
                <Button
                  key="load"
                  type="primary"
                  size="small"
                  onClick={() => {
                    onLoadDraft(draft);
                    onClose();
                  }}
                >
                  Load
                </Button>,
                <Tooltip key="edit" title="Rename draft">
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setEditingTitle(draft.id);
                      setNewTitle(draft.title);
                    }}
                  />
                </Tooltip>,
                <Popconfirm
                  key="delete"
                  title="Delete this draft?"
                  onConfirm={() => onDeleteDraft(draft.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                avatar={<FileTextOutlined style={{ fontSize: "24px" }} />}
                title={
                  editingTitle === draft.id ? (
                    <Space>
                      <Input
                        size="small"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onPressEnter={() => setEditingTitle(null)}
                        style={{ width: 200 }}
                      />
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => setEditingTitle(null)}
                      >
                        Save
                      </Button>
                    </Space>
                  ) : (
                    <Text strong>{draft.title}</Text>
                  )
                }
                description={
                  <div>
                    <div style={{ marginBottom: "8px" }}>
                      <ClockCircleOutlined style={{ marginRight: "4px" }} />
                      <Text type="secondary">
                        {formatDate(draft.updatedAt)}
                      </Text>
                    </div>
                    {getDraftPreview(draft)}
                    <div style={{ marginTop: "8px" }}>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {getDraftDescription(draft)}
                      </Text>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
};

export default UniversalDraftModal;
