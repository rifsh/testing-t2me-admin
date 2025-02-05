import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export const createDateTimeValidation = ({
  compareToField,
  compareType = 'after',
  timezone = dayjs.tz.guess(),
  allowPast = false,
  includeTime = true,
  customMessage
}) => {
  return {
    validator: async (_, value) => {
      if (!value) return Promise.resolve();

      const dateInTimezone = dayjs.isDayjs(value) 
        ? value.tz(timezone)
        : dayjs(value).tz(timezone);
      
      const nowInTimezone = dayjs().tz(timezone);

      if (!allowPast && dateInTimezone.isBefore(nowInTimezone, includeTime ? 'minute' : 'day')) {
        return Promise.reject(new Error('Cannot select a past date'));
      }

      if (compareToField) {
        const form = _.field?.form;
        if (!form) return Promise.resolve();

        const compareValue = form.getFieldValue(compareToField);
        if (!compareValue) return Promise.resolve();

        const compareDate = compareValue.tz(timezone);

        const dateToCompare = includeTime ? dateInTimezone : dateInTimezone.startOf('day');
        const compareDateTime = includeTime ? compareDate : compareDate.startOf('day');

        if (compareType === 'after' && !dateToCompare.isAfter(compareDateTime)) {
          return Promise.reject(new Error(customMessage || `Must be after ${compareToField}`));
        }

        if (compareType === 'same_or_after' && !dateToCompare.isSameOrAfter(compareDateTime)) {
          return Promise.reject(new Error(customMessage || `Must be same as or after ${compareToField}`));
        }
      }

      return Promise.resolve();
    }
  };
};

export const createDateTimePickerProps = ({
  timezone = dayjs.tz.guess(),
  allowPast = false,
  includeTime = true,
  dependsOn = null,
  form = null,
  additionalProps = {}
}) => {
  return {
    showTime: includeTime ? { format: 'HH:mm' } : false,
    format: includeTime ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD',
    style: { width: '100%' },
    disabledDate: (current) => {
      if (!current) return false;

      const currentInTz = current.tz(timezone);
      
      // Past date check
      if (!allowPast) {
        const now = dayjs().tz(timezone);
        if (currentInTz.startOf('day').isBefore(now.startOf('day'))) {
          return true;
        }
      }

      // Dependent field check
      if (dependsOn && form) {
        const dependentValue = form.getFieldValue(dependsOn);
        if (dependentValue) {
          const dependentDate = dayjs(dependentValue).tz(timezone);
          return currentInTz.isBefore(dependentDate, includeTime ? 'minute' : 'day');
        }
      }

      return false;
    },
    disabledTime: includeTime ? (current) => {
      if (!allowPast && current) {
        const now = dayjs().tz(timezone);
        const currentInTz = current.tz(timezone);
        
        if (currentInTz.format('YYYY-MM-DD') === now.format('YYYY-MM-DD')) {
          return {
            disabledHours: () => {
              const hours = [];
              for (let i = 0; i < now.hour(); i++) {
                hours.push(i);
              }
              return hours;
            },
            disabledMinutes: (selectedHour) => {
              if (selectedHour === now.hour()) {
                const minutes = [];
                for (let i = 0; i < now.minute(); i++) {
                  minutes.push(i);
                }
                return minutes;
              }
              return [];
            }
          };
        }
      }
      return {};
    } : undefined,
    ...additionalProps
  };
};