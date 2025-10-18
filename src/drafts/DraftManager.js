class DraftManager {
  constructor() {
    this.dbName = "FormDrafts";
    this.version = 2;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error("❌ IndexedDB error:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        // console.log("✅ IndexedDB opened successfully");
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Delete old store if it exists
        if (db.objectStoreNames.contains("drafts")) {
          db.deleteObjectStore("drafts");
        }

        // Create new store with updated schema
        const store = db.createObjectStore("drafts", { keyPath: "id" });

        // Create indexes for efficient querying
        store.createIndex("formType", "formType", { unique: false });
        store.createIndex("category", "category", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
        store.createIndex("formType_category", ["formType", "category"], {
          unique: false,
        });

        // console.log("✅ IndexedDB store created with indexes");
      };
    });
  }

  async saveDraft(draft) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["drafts"], "readwrite");
      const store = transaction.objectStore("drafts");

      const draftToSave = {
        ...draft,
        updatedAt: new Date().toISOString(),
      };

      // console.log("💾 Saving draft to IndexedDB:", draftToSave.id);

      const request = store.put(draftToSave);
      request.onsuccess = () => {
        // console.log("✅ Draft saved successfully:", draftToSave.id);
        resolve(request.result);
      };
      request.onerror = () => {
        console.error("❌ Error saving draft:", request.error);
        reject(request.error);
      };
    });
  }

  async getDrafts(formType, category = null) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["drafts"], "readonly");
      const store = transaction.objectStore("drafts");

      let request;

      if (category) {
        // Use compound index for efficient filtering
        const index = store.index("formType_category");
        request = index.getAll([formType, category]);
      } else {
        // Get all drafts for this form type
        const index = store.index("formType");
        request = index.getAll(formType);
      }

      request.onsuccess = () => {
        let results = request.result;

        // Sort by updatedAt (most recent first)
        results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        // console.log(
        //   `📊 Retrieved ${results.length} drafts for ${formType}${
        //     category ? ` (${category})` : ""
        //   }`
        // );
        resolve(results);
      };

      request.onerror = () => {
        console.error("❌ Error retrieving drafts:", request.error);
        reject(request.error);
      };
    });
  }

  async deleteDraft(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["drafts"], "readwrite");
      const store = transaction.objectStore("drafts");

      // console.log("🗑️ Deleting draft:", id);

      const request = store.delete(id);
      request.onsuccess = () => {
        // console.log("✅ Draft deleted successfully:", id);
        resolve();
      };
      request.onerror = () => {
        console.error("❌ Error deleting draft:", request.error);
        reject(request.error);
      };
    });
  }

  async clearAllDrafts(formType, category = null) {
    try {
      const drafts = await this.getDrafts(formType, category);
      const promises = drafts.map((draft) => this.deleteDraft(draft.id));
      await Promise.all(promises);
      // console.log(
      //   `🧹 Cleared ${drafts.length} drafts for ${formType}${
      //     category ? ` (${category})` : ""
      //   }`
      // );
    } catch (error) {
      console.error("❌ Error clearing drafts:", error);
      throw error;
    }
  }

  // New method to get draft statistics
  async getDraftStats() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["drafts"], "readonly");
      const store = transaction.objectStore("drafts");

      const request = store.getAll();
      request.onsuccess = () => {
        const drafts = request.result;
        const stats = {};

        drafts.forEach((draft) => {
          const key = draft.formType;
          if (!stats[key]) {
            stats[key] = { count: 0, totalFields: 0 };
          }
          stats[key].count++;
          stats[key].totalFields += draft.metadata?.fieldCount || 0;
        });

        // console.log("📊 Draft statistics:", stats);
        resolve(stats);
      };

      request.onerror = () => reject(request.error);
    });
  }
}

export default DraftManager;
