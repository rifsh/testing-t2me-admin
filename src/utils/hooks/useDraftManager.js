import { useCallback, useState, useRef } from "react";
import { message } from "antd";
import DraftManager from "./DraftManager";

const useDraftManager = ({
  formType,
  recordId,
  category = null,
  onDraftSaved,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const draftManager = useRef(new DraftManager()).current;

  const saveDraft = useCallback(
    async (
      formValues,
      mode = "CREATE",
      titleField = "name",
      excludeFromDraft = []
    ) => {
      setLoading(true);
      setError(null);
      try {
        const cleanValues = { ...formValues };
        excludeFromDraft.forEach((field) => delete cleanValues[field]);
        Object.keys(cleanValues).forEach((key) => {
          if (
            cleanValues[key] === undefined ||
            cleanValues[key] === null ||
            cleanValues[key] === "" ||
            (Array.isArray(cleanValues[key]) && cleanValues[key].length === 0)
          ) {
            delete cleanValues[key];
          }
        });

        if (Object.keys(cleanValues).length === 0) {
          setLoading(false);
          return { success: false, reason: "empty" };
        }

        const draftId = recordId
          ? `${formType}_${recordId}`
          : `${formType}_${Date.now()}`;

        const draftTitle = formValues[titleField]
          ? formValues[titleField]
          : `${formType} Draft ${new Date().toLocaleDateString()}`;

        const draftData = {
          id: draftId,
          formType,
          category,
          title: draftTitle,
          formValues: cleanValues,
          metadata: {
            mode,
            originalRecordId: recordId,
            fieldCount: Object.keys(cleanValues).length,
            hasFiles: Object.values(cleanValues).some(
              (val) =>
                Array.isArray(val) &&
                val.some((item) => item?.originFileObj || item?.file)
            ),
          },
          createdAt: undefined,
          updatedAt: new Date().toISOString(),
        };

        await draftManager.saveDraft(draftData);
        setLoading(false);
        onDraftSaved && onDraftSaved(draftData);
        message.success("Draft saved successfully");
        return { success: true, draftId };
      } catch (err) {
        setLoading(false);
        setError(err);
        message.error("Failed to save draft");
        return { success: false, error: err };
      }
    },
    [draftManager, formType, recordId, category, onDraftSaved]
  );

  const deleteDraft = useCallback(
    async (draftId) => {
      setLoading(true);
      setError(null);
      try {
        await draftManager.deleteDraft(draftId);
        setLoading(false);
        message.success("Draft deleted successfully");
        return { success: true };
      } catch (err) {
        setLoading(false);
        setError(err);
        message.error("Failed to delete draft");
        return { success: false, error: err };
      }
    },
    [draftManager]
  );

  return { saveDraft, deleteDraft, loading, error };
};

export default useDraftManager;
