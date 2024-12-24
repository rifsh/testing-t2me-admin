import { Tag } from "antd";
import dayjs from "dayjs";
import {
  updateSelectedCoupons,
  updateSelectedOffer,
} from "store/slices/scheduleSlice";
class Utils {
  /**
   * Get first character from first & last sentences of a username
   * @param {String} name - Username
   * @return {String} 2 characters string
   */
  static getNameInitial(name) {
    let initials = name.match(/\b\w/g) || [];
    return ((initials.shift() || "") + (initials.pop() || "")).toUpperCase();
  }

  /**
   * Get current path related object from Navigation Tree
   * @param {Function|Array} navTree - Navigation Tree from directory 'configs/NavigationConfig'
   * @param {String} path - Location path you looking for e.g '/app/dashboards/analytic'
   * @return {Object} object that contained the path string
   */
  static getRouteInfo(navTree, path) {
    // Handle case where navTree is a function
    const tree = typeof navTree === "function" ? navTree() : navTree;

    // If tree is empty or not an array, return null
    if (!tree || !Array.isArray(tree)) {
      return null;
    }

    // Search through the navigation tree
    const searchTree = (items) => {
      for (const item of items) {
        // Check if current item's path matches
        if (item.path === path) {
          return item;
        }

        // If item has submenu, search through it
        if (item.submenu && Array.isArray(item.submenu)) {
          const found = searchTree(item.submenu);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };

    return searchTree(tree);
  }

  /**
   * Get accessible color contrast
   * @param {String} hex - Hex color code e.g '#3e82f7'
   * @return {String} 'dark' or 'light'
   */
  static getColorContrast(hex) {
    if (!hex) {
      return "dark";
    }
    const threshold = 130;
    const hRed = hexToR(hex);
    const hGreen = hexToG(hex);
    const hBlue = hexToB(hex);
    function hexToR(h) {
      return parseInt(cutHex(h).substring(0, 2), 16);
    }
    function hexToG(h) {
      return parseInt(cutHex(h).substring(2, 4), 16);
    }
    function hexToB(h) {
      return parseInt(cutHex(h).substring(4, 6), 16);
    }
    function cutHex(h) {
      return h.charAt(0) === "#" ? h.substring(1, 7) : h;
    }
    const cBrightness = (hRed * 299 + hGreen * 587 + hBlue * 114) / 1000;
    if (cBrightness > threshold) {
      return "dark";
    } else {
      return "light";
    }
  }

  /**
   * Darken or lighten a hex color
   * @param {String} color - Hex color code e.g '#3e82f7'
   * @param {Number} percent - Percentage -100 to 100, positive for lighten, negative for darken
   * @return {String} Darken or lighten color
   */
  static shadeColor(color, percent) {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);
    R = parseInt((R * (100 + percent)) / 100);
    G = parseInt((G * (100 + percent)) / 100);
    B = parseInt((B * (100 + percent)) / 100);
    R = R < 255 ? R : 255;
    G = G < 255 ? G : 255;
    B = B < 255 ? B : 255;
    const RR =
      R.toString(16).length === 1 ? `0${R.toString(16)}` : R.toString(16);
    const GG =
      G.toString(16).length === 1 ? `0${G.toString(16)}` : G.toString(16);
    const BB =
      B.toString(16).length === 1 ? `0${B.toString(16)}` : B.toString(16);
    return `#${RR}${GG}${BB}`;
  }

  /**
   * Convert RGBA to HEX
   * @param {String} rgba - RGBA color code e.g 'rgba(197, 200, 198, .2)')'
   * @return {String} HEX color
   */
  static rgbaToHex(rgba) {
    const trim = (str) => str.replace(/^\s+|\s+$/gm, "");
    const inParts = rgba.substring(rgba.indexOf("(")).split(","),
      r = parseInt(trim(inParts[0].substring(1)), 10),
      g = parseInt(trim(inParts[1]), 10),
      b = parseInt(trim(inParts[2]), 10),
      a = parseFloat(
        trim(inParts[3].substring(0, inParts[3].length - 1))
      ).toFixed(2);
    const outParts = [
      r.toString(16),
      g.toString(16),
      b.toString(16),
      Math.round(a * 255)
        .toString(16)
        .substring(0, 2),
    ];

    outParts.forEach(function (part, i) {
      if (part.length === 1) {
        outParts[i] = "0" + part;
      }
    });
    return `#${outParts.join("")}`;
  }

  /**
   * Returns either a positive or negative
   * @param {Number} number - number value
   * @param {any} positive - value that return when positive
   * @param {any} negative - value that return when negative
   * @return {any} positive or negative value based on param
   */
  static getSignNum(number, positive, negative) {
    if (number > 0) {
      return positive;
    }
    if (number < 0) {
      return negative;
    }
    return null;
  }

  /**
   * Returns either ascending or descending value
   * @param {Object} a - antd Table sorter param a
   * @param {Object} b - antd Table sorter param b
   * @param {String} key - object key for compare
   * @return {any} a value minus b value
   */
  static antdTableSorter(a, b, key) {
    if (typeof a[key] === "number" && typeof b[key] === "number") {
      return a[key] - b[key];
    }

    if (typeof a[key] === "string" && typeof b[key] === "string") {
      a = a[key].toLowerCase();
      b = b[key].toLowerCase();
      return a > b ? -1 : b > a ? 1 : 0;
    }
    return;
  }
  static antdTableObjectSorter(a, b, key) {
    // Helper function to access nested properties
    const getValue = (obj, keyPath) => {
      return keyPath.reduce((acc, curr) => (acc ? acc[curr] : undefined), obj);
    };

    const aValue = getValue(a, key);
    const bValue = getValue(b, key);

    if (typeof aValue === "number" && typeof bValue === "number") {
      return aValue - bValue; // Ascending order for numbers
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      const lowerA = aValue.toLowerCase();
      const lowerB = bValue.toLowerCase();
      return lowerA < lowerB ? -1 : lowerA > lowerB ? 1 : 0; // Ascending order for strings
    }

    return 0; // Default for non-comparable types or equal values
  }
  // dateUtil.js

  static formatDate = (inputDate, format = "YYYY-MM-DD") => {
    const date = new Date(inputDate);

    if (format === "YYYY-MM-DD") {
      return date.toLocaleDateString("en-CA"); // Default format (YYYY-MM-DD)
    } else if (format === "HH:mm:ss") {
      return date.toLocaleTimeString("en-GB"); // Time format (HH:mm:ss)
    }
    return null; // Return null if an unsupported format is provided
  };
  /**
   * Filter array of object
   * @param {Array} list - array of objects that need to filter
   * @param {String} key - object key target
   * @param {any} value  - value that excluded from filter
   * @return {Array} a value minus b value
   */
  static filterArray(list, key, value) {
    let data = list;
    if (list) {
      data = list.filter((item) => item[key] === value);
    }
    return data;
  }

  /**
   * Remove object from array by value
   * @param {Array} list - array of objects
   * @param {String} key - object key target
   * @param {any} value  - target value
   * @return {Array} Array that removed target object
   */
  static deleteArrayRow(list, key, value) {
    let data = list;
    if (list) {
      data = list.filter((item) => item[key] !== value);
    }
    return data;
  }

  /**
   * Wild card search on all property of the object
   * @param {Number | String} input - any value to search
   * @param {Array} list - array for search
   * @return {Array} array of object contained keyword
   */
  static wildCardSearch(list, input) {
    const searchText = (item) => {
      for (let key in item) {
        if (item[key] == null) {
          continue;
        }
        if (
          item[key]
            .toString()
            .toUpperCase()
            .indexOf(input.toString().toUpperCase()) !== -1
        ) {
          return true;
        }
      }
    };
    list = list.filter((value) => searchText(value));
    return list;
  }

  /**
   * Get Breakpoint
   * @param {Object} screens - Grid.useBreakpoint() from antd
   * @return {Array} array of breakpoint size
   */
  static getBreakPoint(screens) {
    let breakpoints = [];
    for (const key in screens) {
      if (screens.hasOwnProperty(key)) {
        const element = screens[key];
        if (element) {
          breakpoints.push(key);
        }
      }
    }
    return breakpoints;
  }

  /**
   * Utility to handle rendering and sorting logic for the "Status" column in Ant Design Table.
   * @param {Function} handleUpdateStatus - Function to handle the status update on click.
   * @param {string} dataIndex - The key for the column in the data source (default: 'status').
   * @returns {Object} - An object containing render and sorter logic for the "Status" column.
   */
  static statusColumnUtil = (handleUpdateStatus, dataIndex = "status") => ({
    title: "Status",
    dataIndex: dataIndex,
    render: (_, record) => (
      <Tag
        color={record[dataIndex] ? "green" : "red"}
        style={{ cursor: "pointer" }}
        onClick={() => handleUpdateStatus(record)}
      >
        {record[dataIndex] ? "Active" : "Inactive"}
      </Tag>
    ),
    sorter: (a, b) =>
      a[dataIndex] === b[dataIndex] ? 0 : a[dataIndex] ? -1 : 1,
    sortDirections: ["ascend", "descend"],
  });

  /**
   * Validates if the end date is earlier than the start date.
   * @param {dayjs} startDate
   * @param {dayjs} endDate
   * @returns {boolean}
   */
  static isEndDateValid = (startDate, endDate) => {
    return endDate && endDate.isBefore(startDate, "day");
  };

  /**
   * Validates if the start date is before the schedule start date.
   * @param {dayjs} scheduleStartDate
   * @param {dayjs} startDate
   * @returns {boolean}
   */
  static isStartDateBeforeSchedule = (scheduleStartDate, startDate) => {
    return (
      scheduleStartDate && startDate.isBefore(dayjs(scheduleStartDate), "day")
    );
  };

  /**
   * Validates if the end date is after the schedule end date.
   * @param {dayjs} scheduleEndDate
   * @param {dayjs} endDate
   * @returns {boolean}
   */
  static isEndDateAfterSchedule = (scheduleEndDate, endDate) => {
    return scheduleEndDate && endDate.isAfter(dayjs(scheduleEndDate), "day");
  };

  /**
   * Dispatches the updated offer dates.
   * @param {Function} dispatch
   * @param {Object} selectedItem
   * @param {dayjs} valid_from
   * @param {dayjs} valid_to
   */
  static dispatchOfferDates = (
    dispatch,
    selectedItem,
    valid_from,
    valid_to
  ) => {
    dispatch(
      updateSelectedOffer({
        id: selectedItem.offer.id,
        start_date: valid_from ? valid_from.format("YYYY-MM-DD") : null,
        end_date: valid_to ? valid_to.format("YYYY-MM-DD") : null,
      })
    );
  };
  static dispatchCouponDates = (
    dispatch,
    selectedItem,
    valid_from,
    valid_to
  ) => {
    dispatch(
      updateSelectedCoupons({
        id: selectedItem.coupons.id,
        start_date: valid_from ? valid_from.format("YYYY-MM-DD") : null,
        end_date: valid_to ? valid_to.format("YYYY-MM-DD") : null,
      })
    );
  };
}
export default Utils;
