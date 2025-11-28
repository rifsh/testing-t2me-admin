import {
  isCategoryEnabled,
  isSubcategoryEnabled,
  isItemEnabled,
  isFeatureEnabled,
  getEnabledFeaturesInCategory,
  hasEnabledFeaturesInCategory,
} from '../../src/utils/navigationUtils';
import mockData from '../mock/utils/navigationUtils.mock.json';

// Mock the AppConfig dependency
jest.mock('../../src/configs/AppConfig', () => ({
  NAVIGATION_BAR_FEATURE_FLAGS: mockData.NAVIGATION_BAR_FEATURE_FLAGS,
}));

describe('Navigation Utils', () => {
  describe('isCategoryEnabled', () => {
    it('should return true for an enabled category', () => {
      expect(isCategoryEnabled('orders')).toBe(true);
    });

    it('should return false for a disabled category', () => {
      expect(isCategoryEnabled('disabled_category')).toBe(false);
    });

    it('should return false for a non-existent category', () => {
      expect(isCategoryEnabled('non_existent')).toBe(false);
    });
  });

  describe('isSubcategoryEnabled', () => {
    it('should return true for an enabled subcategory', () => {
      expect(isSubcategoryEnabled('services', 'general')).toBe(true);
    });

    it('should return false for a disabled subcategory', () => {
      expect(isSubcategoryEnabled('services', 'event')).toBe(false);
    });

    it('should return false for a non-existent subcategory', () => {
      expect(isSubcategoryEnabled('services', 'non_existent')).toBe(false);
    });

    it('should return true for an enabled nested subcategory', () => {
      expect(isSubcategoryEnabled('issues', 'track_requests.general')).toBe(true);
    });
  });

  describe('isItemEnabled', () => {
    it('should return true for an enabled item', () => {
      expect(isItemEnabled('services', 'movie', 'list')).toBe(true);
    });

    it('should return false for a disabled item', () => {
      expect(isItemEnabled('services', 'movie', 'add')).toBe(false);
    });

    it('should return false for a non-existent item', () => {
      expect(isItemEnabled('services', 'movie', 'non_existent')).toBe(false);
    });

    it('should return true for a subcategory without items', () => {
        expect(isItemEnabled('services', 'general', 'any')).toBe(true);
    });
  });

  describe('isFeatureEnabled', () => {
    it('should return true for an enabled legacy feature', () => {
      expect(isFeatureEnabled('is_reports_enabled')).toBe(true);
    });

    it('should return false for a disabled legacy feature', () => {
        expect(isFeatureEnabled('is_event_enabled')).toBe(false);
    });

    it('should return true for a non-existent legacy feature', () => {
      expect(isFeatureEnabled('non_existent_feature')).toBe(true);
    });
  });

    describe('getEnabledFeaturesInCategory', () => {
        it('should return an array of enabled features', () => {
            expect(getEnabledFeaturesInCategory('services')).toEqual(['general', 'movie']);
        });

        it('should return an empty array for a disabled category', () => {
            expect(getEnabledFeaturesInCategory('disabled_category')).toEqual([]);
        });
    });

    describe('hasEnabledFeaturesInCategory', () => {
        it('should return true if a category has enabled features', () => {
            expect(hasEnabledFeaturesInCategory('services')).toBe(true);
        });

        it('should return false if a category has no enabled features', () => {
            expect(hasEnabledFeaturesInCategory('disabled_category')).toBe(false);
        });
    });
});
