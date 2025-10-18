import { useCallback, useState, useEffect, useRef } from "react";
import { message } from "antd";
import DraftManager from "../DraftManager";

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
  externalFormData = null,
  onGetCompleteData = null,
}) => {
  const [drafts, setDrafts] = useState([]);
  const [currentDraftId, setCurrentDraftId] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const autoSaveRef = useRef(null);
  const draftManagerRef = useRef(null);

  const draftCategory = `${formType.toLowerCase()}_${mode.toLowerCase()}${
    recordId ? `_record_${recordId}` : "_new"
  }`;

  // Initialize DraftManager
  useEffect(() => {
    const initializeDraftManager = async () => {
      try {
        if (!draftManagerRef.current) {
          draftManagerRef.current = new DraftManager();
          await draftManagerRef.current.init();
        }
        setIsReady(true);
        // console.log(`✅ IndexedDB initialized for ${formType}`);
      } catch (error) {
        console.error("❌ Error initializing IndexedDB:", error);
        message.error("Failed to initialize draft storage");
      }
    };

    initializeDraftManager();
  }, [formType]);

  const loadDrafts = useCallback(async () => {
    if (!isReady || !draftManagerRef.current) return;

    try {
      // console.log(
      //   `📥 Loading drafts for ${formType} with category:`,
      //   draftCategory
      // );

      const storedDrafts = await draftManagerRef.current.getDrafts(
        formType.toLowerCase(),
        draftCategory
      );

      const filteredDrafts = storedDrafts.filter(
        (draft) =>
          draft.formType &&
          draft.formType.toLowerCase() === formType.toLowerCase() &&
          draft.category === draftCategory
      );

      setDrafts(filteredDrafts);
      // console.log(`📊 Loaded ${filteredDrafts.length} drafts for ${formType}`);

      if (filteredDrafts.length > 0) {
        setCurrentDraftId(filteredDrafts[0].id);
      }
    } catch (error) {
      console.error("❌ Error loading drafts:", error);
      setDrafts([]);
    }
  }, [isReady, formType, draftCategory]);

  // Enhanced save with REVERSE intelligent merging
  const saveDraft = useCallback(
    async (formValues, isManual = false) => {
      if (!isReady || !draftManagerRef.current) {
        // console.log("⏳ Draft manager not ready yet");
        return { success: false, reason: "not_ready" };
      }

      try {
        let completeFormData;

        // Get complete data from all steps
        if (onGetCompleteData && typeof onGetCompleteData === "function") {
          completeFormData = onGetCompleteData();
          // console.log(
          //   "📊 Using complete data from onGetCompleteData:",
          //   Object.keys(completeFormData)
          // );
        } else if (externalFormData) {
          const currentValues = form.getFieldsValue();
          completeFormData = {
            ...externalFormData,
            ...currentValues,
          };
          // console.log("📊 Merged external data with current values");
        } else {
          completeFormData = formValues || form.getFieldsValue();
          // console.log("📊 Using current form values only");
        }

        // Get existing draft for intelligent merging
        let existingDraft = null;
        try {
          const existingDrafts = await draftManagerRef.current.getDrafts(
            formType.toLowerCase(),
            draftCategory
          );
          existingDraft = existingDrafts.length > 0 ? existingDrafts[0] : null;
          // console.log("📋 Found existing draft:", existingDraft ? "YES" : "NO");
        } catch (error) {
          // console.log("📋 No existing draft found or error:", error.message);
        }

        // 🔥 HELPER FUNCTION: Check if incoming value should replace existing
        const shouldReplace = (newValue) => {
          if (newValue === undefined || newValue === null) return false;
          if (typeof newValue === "string") return newValue.trim() !== "";
          if (Array.isArray(newValue)) return newValue.length > 0;
          if (typeof newValue === "object" && newValue !== null) return true;
          return newValue !== "";
        };

        // 🔥 REVERSE MERGE LOGIC: Incoming data overwrites if not empty, else preserve existing
        let finalFormData;
        if (existingDraft && existingDraft.formValues) {
          // console.log(
          //   "🔄 Reverse merging: incoming overwrites existing when not empty..."
          // );
          finalFormData = { ...existingDraft.formValues }; // Start with existing

          // Replace with incoming data if incoming field has value
          Object.entries(completeFormData).forEach(([key, incomingValue]) => {
            if (shouldReplace(incomingValue)) {
              // Incoming has data - REPLACE existing
              finalFormData[key] = incomingValue;
              // console.log(`✅ Replaced field with incoming data: ${key}`);
            } else {
              // Incoming is empty - KEEP existing (already in finalFormData)
              // console.log(
              //   `⏭️ Preserved existing field (incoming empty): ${key}`
              // );
            }
          });

          // console.log("📊 Reverse merge summary:", {
          //   existingFields: Object.keys(existingDraft.formValues).length,
          //   incomingFields: Object.keys(completeFormData).length,
          //   finalFields: Object.keys(finalFormData).length,
          //   replacedFields: Object.keys(completeFormData).filter((key) =>
          //     shouldReplace(completeFormData[key])
          //   ).length,
          // });
        } else {
          // console.log("🆕 Creating new draft (no existing draft found)");
          finalFormData = completeFormData;
        }

        const cleanValues = { ...finalFormData };

        // Remove excluded fields
        excludeFromDraft.forEach((field) => delete cleanValues[field]);

        // Remove truly empty values for storage efficiency
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
          // console.log("📝 No data to save for draft");
          return { success: false, reason: "empty" };
        }

        const draftTitle =
          cleanValues[titleField] ||
          `${
            formType.charAt(0).toUpperCase() + formType.slice(1)
          } Draft ${new Date().toLocaleDateString()}`;

        const timestamp = Date.now();
        const draftId = existingDraft
          ? existingDraft.id
          : `${formType.toLowerCase()}_${mode.toLowerCase()}_${timestamp}`;

        const draftData = {
          id: draftId,
          formType: formType.toLowerCase(),
          category: draftCategory,
          mode,
          title: draftTitle,
          formValues: cleanValues, // This now contains reverse-merged data
          metadata: {
            mode,
            recordId,
            fieldCount: Object.keys(cleanValues).length,
            hasFiles: Object.values(cleanValues).some(
              (val) =>
                Array.isArray(val) &&
                val.some((item) => item?.originFileObj || item?.file)
            ),
            savedAt: new Date().toISOString(),
            isMultiStep: !!onGetCompleteData,
            mergeStrategy: "reverse_merge", // 🔥 Track merge strategy
            mergedWith: existingDraft ? "existing_draft_replaced" : "new_draft",
          },
          createdAt: existingDraft
            ? existingDraft.createdAt
            : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // console.log(
        //   `💾 Saving ${
        //     existingDraft ? "reverse-merged" : "new"
        //   } draft for ${formType}:`,
        //   {
        //     id: draftId,
        //     fieldCount: Object.keys(cleanValues).length,
        //     fields: Object.keys(cleanValues),
        //     mergeStrategy: draftData.metadata.mergeStrategy,
        //   }
        // );

        // Delete existing draft first if it exists
        if (existingDraft) {
          await draftManagerRef.current.deleteDraft(existingDraft.id);
          // console.log(
          //   "🗑️ Deleted old draft before saving reverse-merged version"
          // );
        }

        // Save new/merged draft
        await draftManagerRef.current.saveDraft(draftData);

        setDrafts([draftData]);
        setCurrentDraftId(draftId);

        if (isManual) {
          message.success(
            `${formType.charAt(0).toUpperCase() + formType.slice(1)} draft ${
              existingDraft ? "updated with new data" : "saved"
            } (${Object.keys(cleanValues).length} fields)`
          );
        }

        onDraftSaved && onDraftSaved(draftData);
        return { success: true, draftId };
      } catch (error) {
        console.error("❌ Error saving draft:", error);
        if (isManual) {
          message.error("Failed to save draft");
        }
        return { success: false, error };
      }
    },
    [
      isReady,
      formType,
      mode,
      titleField,
      excludeFromDraft,
      recordId,
      draftCategory,
      onDraftSaved,
      externalFormData,
      onGetCompleteData,
      form,
    ]
  );

  // Enhanced load with field preservation
  const loadDraft = useCallback(
    async (draft) => {
      setIsLoading(true);
      try {
        // console.log(`📂 Starting to load draft:`, draft.id);

        if (
          !draft.formType ||
          draft.formType.toLowerCase() !== formType.toLowerCase()
        ) {
          throw new Error(
            `Cannot load ${
              draft.formType || "unknown"
            } draft in ${formType} form`
          );
        }

        if (draft.category !== draftCategory) {
          throw new Error(`Cannot load draft from different context`);
        }

        // Get current form values to preserve
        const currentFormValues = form.getFieldsValue();
        // console.log(
        //   "📋 Current form values before loading:",
        //   Object.keys(currentFormValues)
        // );

        // Process draft values
        const draftValues = JSON.parse(JSON.stringify(draft.formValues));

        // Make file objects extensible
        Object.keys(draftValues).forEach((key) => {
          if (Array.isArray(draftValues[key])) {
            draftValues[key] = draftValues[key].map((item) => {
              if (item && typeof item === "object" && item.uid && item.status) {
                return { ...item }; // Create extensible object
              }
              return item;
            });
          }
        });

        // console.log("📂 Draft values to load:", Object.keys(draftValues));

        // Intelligent field updates - Only update non-empty draft fields
        const fieldsToUpdate = {};

        Object.entries(draftValues).forEach(([fieldName, fieldValue]) => {
          // Only update if the draft field has actual content
          if (
            fieldValue !== undefined &&
            fieldValue !== null &&
            fieldValue !== ""
          ) {
            if (Array.isArray(fieldValue)) {
              if (fieldValue.length > 0) {
                fieldsToUpdate[fieldName] = fieldValue;
              }
            } else {
              fieldsToUpdate[fieldName] = fieldValue;
            }
          }
        });

        // console.log(
        //   "🔧 Fields to update from draft:",
        //   Object.keys(fieldsToUpdate)
        // );
        // console.log(
        //   "🔒 Fields to preserve:",
        //   Object.keys(currentFormValues).filter((key) => !fieldsToUpdate[key])
        // );

        // Update fields individually
        Object.entries(fieldsToUpdate).forEach(([fieldName, fieldValue]) => {
          // console.log(`🔧 Setting field: ${fieldName}`, fieldValue);
          form.setFieldValue(fieldName, fieldValue);
        });

        setCurrentDraftId(draft.id);

        // console.log("✅ Draft loaded successfully");

        // Create merged data for callback
        const mergedData = {
          ...currentFormValues,
          ...fieldsToUpdate,
        };

        onDraftLoaded &&
          onDraftLoaded({
            ...draft,
            formValues: mergedData,
          });

        setIsLoading(false);
        return true;
      } catch (error) {
        console.error("❌ Error loading draft:", error);
        setIsLoading(false);
        throw error;
      }
    },
    [form, formType, draftCategory, onDraftLoaded]
  );

  const deleteDraft = useCallback(async () => {
    if (!isReady || !draftManagerRef.current) return;

    try {
      // console.log(
      //   `🗑️ Deleting drafts for ${formType} with category:`,
      //   draftCategory
      // );

      await draftManagerRef.current.clearAllDrafts(
        formType.toLowerCase(),
        draftCategory
      );

      setDrafts([]);
      setCurrentDraftId(null);

      // Only here we clear the entire form
      form.resetFields();
      // console.log("🧹 Form completely cleared after draft deletion");

      message.success(
        `${
          formType.charAt(0).toUpperCase() + formType.slice(1)
        } draft deleted and form cleared`
      );
    } catch (error) {
      console.error("❌ Error deleting draft:", error);
      message.error("Failed to delete draft");
    }
  }, [isReady, formType, draftCategory, form]);

  // Auto-save functionality
  useEffect(() => {
    if (!enableAutoSave || mode === "EDIT" || !isReady) return;

    const handleAutoSave = () => {
      saveDraft(null, false);
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
  }, [saveDraft, enableAutoSave, mode, autoSaveInterval, isReady]);

  useEffect(() => {
    if (isReady) {
      loadDrafts();
    }
  }, [isReady, loadDrafts]);

  useEffect(() => {
    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, []);

  return {
    drafts,
    saveDraft,
    deleteDraft,
    loadDraft,
    currentDraftId,
    draftCount: drafts.length,
    isReady,
    isLoading,
  };
};

export { useDraft };
