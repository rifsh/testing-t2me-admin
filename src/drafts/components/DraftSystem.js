import React, { useState } from "react";
import { Button, Space, Tooltip, Tag, Modal, Typography, Empty } from "antd";
import {
  SaveOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useDraft } from "drafts/hooks/useDraftManager";

const { Text } = Typography;

const DraftSystem = ({
  form,
  formType,
  mode = "ADD",
  recordId = null,
  style = {},
  size = "small",
  showLabels = true,
  autoSaveInterval = 3000,
  titleField = "name",
  excludeFromDraft = [],
  onDraftSaved = null,
  onDraftLoaded = null,
  enableAutoSave = true,
}) => {
  const {
    drafts,
    saveDraft,
    deleteDraft,
    loadDraft,
    currentDraftId,
    draftCount,
  } = useDraft({
    form,
    formType,
    mode,
    recordId,
    titleField,
    excludeFromDraft,
    onDraftSaved,
    onDraftLoaded,
    enableAutoSave,
    autoSaveInterval,
  });

  const [modalVisible, setModalVisible] = useState(false);

  const handleManualSave = async () => {
    const values = form.getFieldsValue();
    await saveDraft(values, true);
  };

  const handleLoadDraft = () => {
    if (drafts.length > 0) {
      loadDraft(drafts[0]);
      setModalVisible(false);
    }
  };

  const handleDeleteDraft = () => {
    deleteDraft();
    setModalVisible(false);
  };

  // Don't show for edit mode
  if (mode.toUpperCase() === "EDIT") {
    return null;
  }

  return (
    <div style={style}>
      <Space size="small">
        <Tooltip title={`Save current ${formType} form as draft`}>
          <Button
            icon={<SaveOutlined />}
            onClick={handleManualSave}
            size={size}
          >
            {showLabels && "Save Draft"}
          </Button>
        </Tooltip>

        <Tooltip title={`Load ${formType} draft`}>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => setModalVisible(true)}
            size={size}
            disabled={draftCount === 0}
          >
            {showLabels && `Load Draft`}
          </Button>
        </Tooltip>

        {currentDraftId && (
          <Tag color="green" style={{ margin: 0 }}>
            <ClockCircleOutlined style={{ marginRight: "4px" }} />
            Draft Active
          </Tag>
        )}
      </Space>

      <Modal
        title={`${formType.toUpperCase()} Draft`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={500}
        footer={null}
      >
        {drafts.length === 0 ? (
          <Empty description={`No ${formType} draft available`} />
        ) : (
          <div>
            <div>
              <Text strong>{drafts[0].title}</Text>
              <br />
              <Text type="secondary">
                Last updated: {new Date(drafts[0].updatedAt).toLocaleString()}
              </Text>
              <br />
              <Text type="secondary">
                {drafts[0].metadata.fieldCount} fields saved
              </Text>
            </div>
            <Space>
              <Button type="primary" onClick={handleLoadDraft}>
                Load Draft
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleDeleteDraft}
              >
                Delete Draft
              </Button>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DraftSystem;
