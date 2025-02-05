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
  compareType = 'before',
  timezone = dayjs.tz.guess(),
  allowPast = false,
  customMessage,
  includeTime = true
}) => {
  return {
    validator: async (_, value) => {
      if (!value) return Promise.resolve();

      const dateInTimezone = dayjs.isDayjs(value) 
        ? value.tz(timezone)
        : dayjs(value).tz(timezone);
      
      const nowInTimezone = dayjs().tz(timezone);

      // Past date validation
      if (!allowPast && dateInTimezone.isBefore(nowInTimezone, includeTime ? 'minute' : 'day')) {
        return Promise.reject(new Error('Cannot select a past date'));
      }

      if (compareToField) {
        const form = _.field?.form;
        if (!form) return Promise.resolve();

        const compareValue = form.getFieldValue(compareToField);
        if (!compareValue) return Promise.resolve();

        const compareDate = compareValue.tz(timezone);

        // For date-only comparisons, set time to start of day
        const dateToCompare = includeTime ? dateInTimezone : dateInTimezone.startOf('day');
        const compareDateTime = includeTime ? compareDate : compareDate.startOf('day');

        const comparisonMap = {
          before: {
            condition: dateToCompare.isBefore(compareDateTime),
            defaultMessage: `Must be before ${compareToField}`
          },
          after: {
            condition: dateToCompare.isAfter(compareDateTime),
            defaultMessage: `Must be after ${compareToField}`
          },
          same_or_before: {
            condition: dateToCompare.isSameOrBefore(compareDateTime),
            defaultMessage: `Must be same as or before ${compareToField}`
          },
          same_or_after: {
            condition: dateToCompare.isSameOrAfter(compareDateTime),
            defaultMessage: `Must be same as or after ${compareToField}`
          }
        };

        const comparison = comparisonMap[compareType];
        if (!comparison.condition) {
          return Promise.reject(
            new Error(customMessage || comparison.defaultMessage)
          );
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
  depend_timesOn,
  form,
  additionalProps = {}
}) => {
  return {
    showTime: includeTime ? { format: 'HH:mm' } : false,
    format: includeTime ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD',
    style: { width: '100%' },
    disabledDate: (current) => {
      if (!allowPast && current) {
        const now = dayjs().tz(timezone);
        const currentInTz = current.tz(timezone);
        
        // Check against the dependent field if specified
        if (depend_timesOn && form) {
          const dependentValue = form.getFieldValue(depend_timesOn);
          if (dependentValue) {
            const dependentDate = dayjs(dependentValue).tz(timezone);
            return currentInTz.startOf('day').isBefore(dependentDate.startOf('day')) || 
                   currentInTz.startOf('day').isBefore(now.startOf('day'));
          }
        }
        
        return currentInTz.startOf('day').isBefore(now.startOf('day'));
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