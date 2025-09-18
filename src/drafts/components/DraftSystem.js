import React, { useState } from "react";
import {
  Button,
  Space,
  Tooltip,
  Tag,
  Modal,
  Typography,
  Empty,
  Spin,
  message,
} from "antd";
import {
  SaveOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  DatabaseOutlined,
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
  externalFormData = null,
  onGetCompleteData = null,
}) => {
  const {
    drafts,
    saveDraft,
    deleteDraft,
    loadDraft,
    currentDraftId,
    draftCount,
    isReady,
    isLoading,
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
    externalFormData,
    onGetCompleteData,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleManualSave = async () => {
    try {
      setIsSaving(true);
      const values = form.getFieldsValue();
      await saveDraft(values, true);
    } catch (error) {
      console.error("Manual save error:", error);
      message.error("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadDraft = async () => {
    if (drafts.length > 0) {
      try {
        console.log("🔄 Starting draft load...");

        await loadDraft(drafts[0]);

        console.log("✅ Draft loaded successfully");
        message.success(
          `Draft loaded: ${drafts[0].metadata.fieldCount} fields updated`
        );
        setModalVisible(false);
      } catch (error) {
        console.error("❌ Draft loading failed:", error);
        message.error("Failed to load draft");
      }
    }
  };

  const handleDeleteDraft = async () => {
    try {
      await deleteDraft();
      setModalVisible(false);
    } catch (error) {
      console.error("Delete draft error:", error);
      message.error("Failed to delete draft");
    }
  };

  // Don't show for edit mode
  if (mode.toUpperCase() === "EDIT") {
    return null;
  }

  // Show loading state while IndexedDB initializes
  if (!isReady) {
    return (
      <div style={style}>
        <Space size="small">
          <Spin size="small" />
          <Text type="secondary">Initializing drafts...</Text>
        </Space>
      </div>
    );
  }

  return (
    <div style={style}>
      <Space size="small">
        <Tooltip title={`Save current ${formType} form as draft (IndexedDB)`}>
          <Button
            icon={<SaveOutlined />}
            onClick={handleManualSave}
            size={size}
            loading={isSaving}
            disabled={isSaving}
          >
            {showLabels && (isSaving ? "Saving..." : "Save Draft")}
          </Button>
        </Tooltip>

        <Tooltip title={`Load ${formType} draft from IndexedDB`}>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => setModalVisible(true)}
            size={size}
            disabled={draftCount === 0 || isLoading}
            loading={isLoading}
          >
            {showLabels && `Load Draft`}
            {draftCount > 0 && (
              <span style={{ marginLeft: "4px", color: "#52c41a" }}>●</span>
            )}
          </Button>
        </Tooltip>

        {currentDraftId && (
          <Tag color="green" style={{ margin: 0 }}>
            <DatabaseOutlined style={{ marginRight: "4px" }} />
            {formType.charAt(0).toUpperCase() + formType.slice(1)} Draft Saved
          </Tag>
        )}
      </Space>

      <Modal
        title={
          <Space>
            <DatabaseOutlined />
            {`${formType.toUpperCase()} Draft (IndexedDB)`}
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={500}
        footer={null}
      >
        {drafts.length === 0 ? (
          <Empty description={`No ${formType} draft available`} />
        ) : (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>{drafts[0].title}</Text>
              <br />
              <Text type="secondary">Form Type: {drafts[0].formType}</Text>
              <br />
              <Text type="secondary">Storage: IndexedDB</Text>
              <br />
              <Text type="secondary">
                Last updated: {new Date(drafts[0].updatedAt).toLocaleString()}
              </Text>
              <br />
              <Text type="secondary">
                Contains {drafts[0].metadata.fieldCount} completed field
                {drafts[0].metadata.fieldCount !== 1 ? "s" : ""}
              </Text>
              {drafts[0].metadata.mergedWith && (
                <>
                  <br />
                  <Text
                    type="secondary"
                    style={{ fontSize: "12px", fontStyle: "italic" }}
                  >
                    (Merged with {drafts[0].metadata.mergedWith})
                  </Text>
                </>
              )}
            </div>
            <Space>
              <Button
                type="primary"
                onClick={handleLoadDraft}
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Load Draft"}
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleDeleteDraft}
                disabled={isLoading}
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
