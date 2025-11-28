import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

import {
  createDateTimeValidation,
  createDateTimePickerProps,
  getCurrentTimeByTimezone,
  getTimezoneAbbr,
  formatDateTimeWithTimezone,
  formatDateInTimezone,
  formatTimeInTimezone,
  formatTimeWithTimezone,
} from '../../src/utils/time_zone_util';
import mockData from '../mock/utils/time_zone_util.mock.json';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

describe('Time Zone Utilities', () => {
  describe('getCurrentTimeByTimezone', () => {
    it('should return a valid date for a valid timezone', () => {
      const date = getCurrentTimeByTimezone(mockData.timezone);
      expect(date).toBeInstanceOf(Date);
    });

    it('should return null for an invalid timezone', () => {
      const date = getCurrentTimeByTimezone('Invalid/Timezone');
      expect(date).toBeNull();
    });
  });

  describe('getTimezoneAbbr', () => {
    it('should return the correct abbreviation for a known timezone', () => {
      const abbr = getTimezoneAbbr('Asia/Kolkata');
      expect(abbr).toBe('IST');
    });

    it('should return the abbreviation from dayjs for an unknown timezone', () => {
      const abbr = getTimezoneAbbr('America/New_York');
      expect(abbr).toBe('EST/EDT');
    });
  });

  describe('formatDateTimeWithTimezone', () => {
    it('should format the date and time with the timezone abbreviation', () => {
      const formatted = formatDateTimeWithTimezone(
        mockData.dateTime,
        mockData.timezone
      );
      expect(formatted).toBe('October 27, 2023 3:30 PM IST');
    });
  });

  describe('formatDateInTimezone', () => {
    it('should format the date in the specified timezone', () => {
      const formatted = formatDateInTimezone(mockData.date, mockData.timezone);
      expect(formatted).toBe('October 27, 2023');
    });
  });

  describe('formatTimeInTimezone', () => {
    it('should format the time in the specified timezone', () => {
      const formatted = formatTimeInTimezone(mockData.time, mockData.timezone);
      expect(formatted).toBe('10:00 AM');
    });
  });

  describe('formatTimeWithTimezone', () => {
    it('should format the time with the timezone abbreviation', () => {
      const formatted = formatTimeWithTimezone(mockData.time, mock.timezone);
      expect(formatted).toBe('10:00 AM IST');
    });
  });
});
