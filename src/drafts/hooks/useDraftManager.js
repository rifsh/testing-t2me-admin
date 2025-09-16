
import { useCallback, useState, useEffect, useRef } from "react";
import { message } from "antd";

const useDraft = ({
  form,
  formType,
  mode = "ADD",
  recordId = null,
  titleField = "name",
  excludeFromDraft = [],
  enableAutoSave = true,
  autoSaveInterval = 3000,
  onDraftSaved = null,
  onDraftLoaded = null,
}) => {
  const [drafts, setDrafts] = useState([]);
  const [currentDraftId, setCurrentDraftId] = useState(null);
  const autoSaveRef = useRef(null);

  const draftKey = `draft_${formType}`;

  // Load drafts from localStorage
  const loadDrafts = useCallback(() => {
    try {
      const stored = localStorage.getItem(draftKey);
      const parsedDrafts = stored ? JSON.parse(stored) : [];
      setDrafts(Array.isArray(parsedDrafts) ? parsedDrafts : []);
    } catch (error) {
      console.error("Error loading drafts:", error);
      setDrafts([]);
    }
  }, [draftKey]);

  // Save drafts to localStorage
  const saveDraftsToStorage = useCallback(
    (updatedDrafts) => {
      try {
        localStorage.setItem(draftKey, JSON.stringify(updatedDrafts));
        setDrafts(updatedDrafts);
      } catch (error) {
        console.error("Error saving drafts:", error);
      }
    },
    [draftKey]
  );

  // Save draft - only one draft per formType
  const saveDraft = useCallback(
    async (formValues, isManual = false) => {
      try {
        const cleanValues = { ...formValues };

        // Remove excluded fields
        excludeFromDraft.forEach((field) => delete cleanValues[field]);

        // Remove empty values
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
          return { success: false, reason: "empty" };
        }

        const draftTitle =
          cleanValues[titleField] ||
          `${formType} Draft ${new Date().toLocaleDateString()}`;
        const draftId = `${formType}_draft`;

        const draftData = {
          id: draftId,
          formType,
          title: draftTitle,
          formValues: cleanValues,
          metadata: {
            mode,
            recordId,
            fieldCount: Object.keys(cleanValues).length,
            hasFiles: Object.values(cleanValues).some(
              (val) =>
                Array.isArray(val) &&
                val.some((item) => item?.originFileObj || item?.file)
            ),
          },
          createdAt:
            drafts.length === 0
              ? new Date().toISOString()
              : drafts[0]?.createdAt,
          updatedAt: new Date().toISOString(),
        };

        // Replace existing draft (only one draft per formType)
        const newDrafts = [draftData];
        saveDraftsToStorage(newDrafts);
        setCurrentDraftId(draftId);

        if (isManual) {
          message.success("Draft saved successfully");
        }

        onDraftSaved && onDraftSaved(draftData);
        return { success: true, draftId };
      } catch (error) {
        console.error("Error saving draft:", error);
        if (isManual) {
          message.error("Failed to save draft");
        }
        return { success: false, error };
      }
    },
    [
      formType,
      titleField,
      excludeFromDraft,
      mode,
      recordId,
      drafts,
      saveDraftsToStorage,
      onDraftSaved,
    ]
  );

  // Load draft
  const loadDraft = useCallback(
    (draft) => {
      try {
        form.setFieldsValue(draft.formValues);
        setCurrentDraftId(draft.id);
        message.success("Draft loaded successfully");
        onDraftLoaded && onDraftLoaded(draft);
      } catch (error) {
        console.error("Error loading draft:", error);
        message.error("Failed to load draft");
      }
    },
    [form, onDraftLoaded]
  );

  // Delete draft
  const deleteDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey);
      setDrafts([]);
      setCurrentDraftId(null);
      message.success("Draft deleted successfully");
    } catch (error) {
      console.error("Error deleting draft:", error);
      message.error("Failed to delete draft");
    }
  }, [draftKey]);

  // Auto-save functionality
  useEffect(() => {
    if (!enableAutoSave || mode === "EDIT") return;

    const handleAutoSave = () => {
      const values = form.getFieldsValue();
      saveDraft(values, false);
    };

    if (autoSaveRef.current) {
      clearInterval(autoSaveRef.current);
    }

    autoSaveRef.current = setInterval(handleAutoSave, autoSaveInterval);

    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [form, saveDraft, enableAutoSave, mode, autoSaveInterval]);

  // Load drafts on mount
  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  return {
    drafts,
    saveDraft,
    deleteDraft,
    loadDraft,
    currentDraftId,
    draftCount: drafts.length,
  };
};

export { useDraft };
