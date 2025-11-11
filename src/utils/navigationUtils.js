import { NAVIGATION_BAR_FEATURE_FLAGS } from "configs/AppConfig";

/**
 * Check if a main category is enabled
 * @param {string} category - Main category (orders, services, issues, etc.)
 * @returns {boolean}
 */
export const isCategoryEnabled = (category) => {
  const categoryConfig = NAVIGATION_BAR_FEATURE_FLAGS[category];
  return categoryConfig && categoryConfig.enabled === true;
};

/**
 * Check if a subcategory is enabled
 * @param {string} category - Main category
 * @param {string} subcategory - Subcategory name (can be nested like "track_requests.general")
 * @returns {boolean}
 */
export const isSubcategoryEnabled = (category, subcategory) => {
  if (!isCategoryEnabled(category)) return false;
  
  const categoryConfig = NAVIGATION_BAR_FEATURE_FLAGS[category];
  
  // Handle nested subcategories (e.g., "track_requests.general")
  if (subcategory.includes('.')) {
    const parts = subcategory.split('.');
    let currentConfig = categoryConfig;
    
    // Traverse the nested structure
    for (let i = 0; i < parts.length; i++) {
      if (!currentConfig.subitems) return false;
      currentConfig = currentConfig.subitems[parts[i]];
      if (!currentConfig) return false;
      if (i < parts.length - 1 && currentConfig.enabled !== true) return false;
    }
    
    return currentConfig && currentConfig.enabled === true;
  }
  
  // Handle single-level subcategory
  const subConfig = categoryConfig.subitems && categoryConfig.subitems[subcategory];
  return subConfig && subConfig.enabled === true;
};

/**
 * Check if a specific item is enabled (for 3-level structure)
 * @param {string} category - Main category
 * @param {string} subcategory - Subcategory (can be nested like "track_requests.general")
 * @param {string} item - Specific item
 * @returns {boolean}
 */
export const isItemEnabled = (category, subcategory, item) => {
  if (!isSubcategoryEnabled(category, subcategory)) return false;
  
  const categoryConfig = NAVIGATION_BAR_FEATURE_FLAGS[category];
  
  // Handle nested subcategories (e.g., "track_requests.general")
  if (subcategory.includes('.')) {
    const parts = subcategory.split('.');
    let currentConfig = categoryConfig;
    
    // Traverse the nested structure to find the subcategory
    for (const part of parts) {
      if (!currentConfig.subitems) return false;
      currentConfig = currentConfig.subitems[part];
      if (!currentConfig) return false;
    }
    
    // Handle 2-level structure (no items property)
    if (!currentConfig.items) return true;
    
    // Handle 3-level structure
    const itemConfig = currentConfig.items[item];
    return itemConfig && itemConfig.enabled === true;
  }
  
  // Handle single-level subcategory
  const subConfig = categoryConfig.subitems[subcategory];
  
  // Handle 2-level structure (no items property)
  if (!subConfig.items) return true;
  
  // Handle 3-level structure
  const itemConfig = subConfig.items[item];
  return itemConfig && itemConfig.enabled === true;
};

/**
 * Legacy compatibility function for existing code
 * @param {string} featureFlag - Old feature flag name
 * @returns {boolean}
 */
export const isFeatureEnabled = (featureFlag) => {
  if (!featureFlag) return true;
  
  const legacyMapping = {
    'is_reports_enabled': () => isCategoryEnabled('orders'),
    'is_batchrun_enabled': () => isCategoryEnabled('batchrun'),
    'is_general_enabled': () => isSubcategoryEnabled('services', 'general'),
    'is_event_enabled': () => isSubcategoryEnabled('services', 'event'),
    'is_movie_enabled': () => isSubcategoryEnabled('services', 'movie'),
    'is_dine_enabled': () => isSubcategoryEnabled('services', 'dine'),
    'is_advertisement_enabled': () => isCategoryEnabled('advertisements'),
    'is_newsletter_enabled': () => isCategoryEnabled('newsletter'),
    'is_user_management_enabled': () => isCategoryEnabled('user_management'),
    'is_app_management_enabled': () => isCategoryEnabled('app_management'),
    'is_issue_tracking_enabled': () => isSubcategoryEnabled('issues', 'issue_tracking'),
    'is_track_requests_enabled': () => isSubcategoryEnabled('issues', 'track_requests'),
    'is_lead_events_enabled': () => isSubcategoryEnabled('issues', 'lead_events'),
  };
  
  const mappingFunction = legacyMapping[featureFlag];
  return mappingFunction ? mappingFunction() : true;
};

/**
 * Get all enabled features within a category
 * @param {string} category - The main category
 * @returns {string[]} - Array of enabled feature names
 */
export const getEnabledFeaturesInCategory = (category) => {
  if (!isCategoryEnabled(category)) {
    return [];
  }
  
  const categoryConfig = NAVIGATION_BAR_FEATURE_FLAGS[category];
  const subitems = categoryConfig.subitems || {};
  
  return Object.keys(subitems).filter(subitem => 
    subitems[subitem].enabled === true
  );
};

/**
 * Check if any features in a category are enabled
 * @param {string} category - The main category
 * @returns {boolean} - Whether any features in the category are enabled
 */
export const hasEnabledFeaturesInCategory = (category) => {
  return getEnabledFeaturesInCategory(category).length > 0;
};
