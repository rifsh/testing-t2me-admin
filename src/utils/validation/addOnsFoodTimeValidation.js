    import dayjs from "dayjs";

/**
 * Time Slot Validation Utility Class
 * Provides comprehensive validation for food time slots
 */
export class AddOnsFoodTimeSlotValidator {
  /**
   * Validates a single time slot
   * @param {Object} slot - The time slot object to validate
   * @returns {Object} - { passed: boolean, message: string }
   */
  static validateSingleSlot(slot) {
    // Check if slot name is provided
    if (!slot.name || slot.name.trim() === '') {
      return { passed: false, message: 'Slot name is required' };
    }

    // Check slot name length
    if (slot.name.trim().length < 2) {
      return { passed: false, message: 'Slot name must be at least 2 characters long' };
    }

    // Check slot name length (max 50 characters)
    if (slot.name.trim().length > 50) {
      return { passed: false, message: 'Slot name cannot exceed 50 characters' };
    }

    // Validate slot name characters (only letters, numbers, spaces, and basic punctuation)
    const nameRegex = /^[a-zA-Z0-9\s\-_.,()]+$/;
    if (!nameRegex.test(slot.name.trim())) {
      return { passed: false, message: 'Slot name contains invalid characters' };
    }

    // Check if start time is provided
    if (!slot.start_time) {
      return { passed: false, message: 'Start time is required' };
    }

    // Check if end time is provided
    if (!slot.end_time) {
      return { passed: false, message: 'End time is required' };
    }

    // Validate time range
    if (slot.start_time && slot.end_time) {
      const startTime = dayjs(slot.start_time);
      const endTime = dayjs(slot.end_time);

      if (!endTime.isAfter(startTime)) {
        return { passed: false, message: 'End time must be after start time' };
      }

      // Check minimum duration (at least 30 minutes)
      const duration = endTime.diff(startTime, 'minute');
      if (duration < 30) {
        return { passed: false, message: 'Time slot must be at least 30 minutes long' };
      }

      // Check maximum duration (no more than 12 hours)
      if (duration > 720) {
        return { passed: false, message: 'Time slot cannot exceed 12 hours' };
      }
    }

    // Check number of tickets
    if (!slot.num_of_tickets || slot.num_of_tickets < 1) {
      return { passed: false, message: 'Number of tickets must be at least 1' };
    }

    // Check maximum tickets limit
    if (slot.num_of_tickets > 10000) {
      return { passed: false, message: 'Number of tickets cannot exceed 10,000' };
    }

    return { passed: true, message: '' };
  }

  /**
   * Validates all time slots for duplicate names
   * @param {Array} slots - Array of time slot objects
   * @returns {Object} - { passed: boolean, message: string }
   */
  static validateUniqueNames(slots) {
    const names = slots.map((slot) => slot.name?.toLowerCase().trim()).filter(name => name);
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
    
    if (duplicates.length > 0) {
      return { passed: false, message: `Duplicate slot names found: ${duplicates.join(', ')}` };
    }
    
    return { passed: true, message: '' };
  }

  /**
   * Validates all time slots for overlapping times
   * @param {Array} slots - Array of time slot objects
   * @returns {Object} - { passed: boolean, message: string }
   */
  static validateTimeOverlaps(slots) {
    const validSlots = slots.filter(slot => slot.start_time && slot.end_time);
    
    for (let i = 0; i < validSlots.length; i++) {
      for (let j = i + 1; j < validSlots.length; j++) {
        const slot1 = validSlots[i];
        const slot2 = validSlots[j];
        
        const start1 = dayjs(slot1.start_time);
        const end1 = dayjs(slot1.end_time);
        const start2 = dayjs(slot2.start_time);
        const end2 = dayjs(slot2.end_time);
        
        // Check if times overlap
        if (start1.isBefore(end2) && start2.isBefore(end1)) {
          return { 
            passed: false, 
            message: `Time slots "${slot1.name}" and "${slot2.name}" have overlapping times` 
          };
        }
      }
    }
    
    return { passed: true, message: '' };
  }

  /**
   * Validates business hours (optional - you can customize this)
   * @param {Array} slots - Array of time slot objects
   * @returns {Object} - { passed: boolean, message: string }
   */
  static validateBusinessHours(slots) {
    const businessStart = 6; // 6 AM
    const businessEnd = 23; // 11 PM
    
    for (const slot of slots) {
      if (slot.start_time && slot.end_time) {
        const startHour = dayjs(slot.start_time).hour();
        const endHour = dayjs(slot.end_time).hour();
        
        if (startHour < businessStart || endHour > businessEnd) {
          return { 
            passed: false, 
            message: `Slot "${slot.name}" is outside business hours (6 AM - 11 PM)` 
          };
        }
      }
    }
    
    return { passed: true, message: '' };
  }

  /**
   * Comprehensive validation for all time slots
   * @param {Array} slots - Array of time slot objects
   * @param {Object} options - Validation options
   * @returns {Object} - { passed: boolean, message: string, errors: Array }
   */
  static validateAllSlots(slots, options = {}) {
    const errors = [];
    const {
      checkBusinessHours = false,
      checkOverlaps = true,
      requireUniqueNames = true
    } = options;

    // Validate individual slots
    slots.forEach((slot, index) => {
      const validation = this.validateSingleSlot(slot);
      if (!validation.passed) {
        errors.push(`Slot ${index + 1}: ${validation.message}`);
      }
    });

    // Check for unique names
    if (requireUniqueNames) {
      const nameValidation = this.validateUniqueNames(slots);
      if (!nameValidation.passed) {
        errors.push(nameValidation.message);
      }
    }

    // Check for time overlaps
    if (checkOverlaps) {
      const overlapValidation = this.validateTimeOverlaps(slots);
      if (!overlapValidation.passed) {
        errors.push(overlapValidation.message);
      }
    }

    // Check business hours
    if (checkBusinessHours) {
      const businessHoursValidation = this.validateBusinessHours(slots);
      if (!businessHoursValidation.passed) {
        errors.push(businessHoursValidation.message);
      }
    }

    return {
      passed: errors.length === 0,
      message: errors.length > 0 ? errors[0] : '',
      errors: errors
    };
  }
}
