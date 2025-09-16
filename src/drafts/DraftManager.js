// DraftManager.js
class DraftManager {
  constructor() {
    this.dbName = "UniversalFormDrafts";
    this.version = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("drafts")) {
          const store = db.createObjectStore("drafts", { keyPath: "id" });
          store.createIndex("createdAt", "createdAt", { unique: false });
          store.createIndex("updatedAt", "updatedAt", { unique: false });
          store.createIndex("formType", "formType", { unique: false });
          store.createIndex("category", "category", { unique: false });
        }
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

      const request = store.put(draftToSave);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getDrafts(formType, category = null) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["drafts"], "readonly");
      const store = transaction.objectStore("drafts");

      let request;
      if (category) {
        request = store.getAll();
      } else {
        const index = store.index("formType");
        request = index.getAll(formType);
      }

      request.onsuccess = () => {
        let results = request.result;
        if (category) {
          results = results.filter(
            (draft) =>
              draft.formType === formType && draft.category === category
          );
        }
        results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteDraft(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["drafts"], "readwrite");
      const store = transaction.objectStore("drafts");

      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllDrafts(formType, category = null) {
    const drafts = await this.getDrafts(formType, category);
    const promises = drafts.map((draft) => this.deleteDraft(draft.id));
    return Promise.all(promises);
  }
}

export default DraftManager;
