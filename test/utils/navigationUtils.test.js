
import {
  isCategoryEnabled,
  isSubcategoryEnabled,
  isItemEnabled,
  isFeatureEnabled,
  getEnabledFeaturesInCategory,
  hasEnabledFeaturesInCategory,
} from 'utils/navigationUtils';
import { NAVIGATION_BAR_FEATURE_FLAGS } from 'configs/AppConfig';
import mockData from 'test/mock/utils/navigationUtils.mock.json';

jest.mock('configs/AppConfig', () => ({
  NAVIGATION_BAR_FEATURE_FLAGS: {
    orders: { enabled: true },
    services: {
      enabled: true,
      subitems: {
        general: { enabled: true, items: { item1: { enabled: true }, item2: { enabled: false } } },
        event: { enabled: true },
        movie: { enabled: false },
      },
    },
    issues: {
        enabled: true,
        subitems: {
          issue_tracking: { enabled: true },
          track_requests: {
            enabled: true,
            subitems: {
              general: { enabled: true, items: { nestedItem1: { enabled: true }, nestedItem2: { enabled: false } } },
              disabled: { enabled: false },
            },
          },
        },
      },
    disabledCategory: { enabled: false },
  },
}));

describe('navigationUtils', () => {
  describe('isCategoryEnabled', () => {
    it('should return true for an enabled category', () => {
      const { enabled } = mockData.isCategoryEnabled;
      expect(isCategoryEnabled(enabled)).toBe(true);
    });

    it('should return false for a disabled category', () => {
      const { disabled } = mockData.isCategoryEnabled;
      expect(isCategoryEnabled(disabled)).toBe(false);
    });
  });

  describe('isSubcategoryEnabled', () => {
    const { category, enabledSubcategory, disabledSubcategory, nested } = mockData.isSubcategoryEnabled;

    it('should return true for an enabled subcategory', () => {
      expect(isSubcategoryEnabled(category, enabledSubcategory)).toBe(true);
    });

    it('should return false for a disabled subcategory', () => {
      expect(isSubcategoryEnabled(category, disabledSubcategory)).toBe(false);
    });

    it('should return true for an enabled nested subcategory', () => {
      expect(isSubcategoryEnabled(nested.category, nested.enabledSubcategory)).toBe(true);
    });

    it('should return false for a disabled nested subcategory', () => {
      expect(isSubcategoryEnabled(nested.category, nested.disabledSubcategory)).toBe(false);
    });
  });

  describe('isItemEnabled', () => {
    const { category, subcategory, enabledItem, disabledItem, nested } = mockData.isItemEnabled;

    it('should return true for an enabled item', () => {
      expect(isItemEnabled(category, subcategory, enabledItem)).toBe(true);
    });

    it('should return false for a disabled item', () => {
      expect(isItemEnabled(category, subcategory, disabledItem)).toBe(false);
    });

    it('should return true for an enabled nested item', () => {
      expect(isItemEnabled(nested.category, nested.subcategory, nested.enabledItem)).toBe(true);
    });

    it('should return false for a disabled nested item', () => {
      expect(isItemEnabled(nested.category, nested.subcategory, nested.disabledItem)).toBe(false);
    });
  });

  describe('isFeatureEnabled', () => {
    const { enabledFeature, disabledFeature, undefinedFeature } = mockData.isFeatureEnabled;

    it('should return true for an enabled legacy feature', () => {
      expect(isFeatureEnabled(enabledFeature)).toBe(true);
    });

    it('should return true for a disabled or unmapped legacy feature', () => {
        expect(isFeatureEnabled(disabledFeature)).toBe(true);
      });

    it('should return true for an undefined feature', () => {
      expect(isFeatureEnabled(undefinedFeature)).toBe(true);
    });
  });

  describe('getEnabledFeaturesInCategory', () => {
    const { categoryWithFeatures, categoryWithoutFeatures, disabledCategory } = mockData.getEnabledFeaturesInCategory;

    it('should return enabled features in a category', () => {
      expect(getEnabledFeaturesInCategory(categoryWithFeatures)).toEqual(['general', 'event']);
    });

    it('should return an empty array for a category without subitems', () => {
      expect(getEnabledFeaturesInCategory(categoryWithoutFeatures)).toEqual([]);
    });

    it('should return an empty array for a disabled category', () => {
      expect(getEnabledFeaturesInCategory(disabledCategory)).toEqual([]);
    });
  });

  describe('hasEnabledFeaturesInCategory', () => {
    const { categoryWithFeatures, categoryWithoutFeatures, disabledCategory } = mockData.hasEnabledFeaturesInCategory;

    it('should return true if a category has enabled features', () => {
      expect(hasEnabledFeaturesInCategory(categoryWithFeatures)).toBe(true);
    });

    it('should return false if a category has no enabled features', () => {
      expect(hasEnabledFeaturesInCategory(categoryWithoutFeatures)).toBe(false);
    });

    it('should return false for a disabled category', () => {
      expect(hasEnabledFeaturesInCategory(disabledCategory)).toBe(false);
    });
  });
});
