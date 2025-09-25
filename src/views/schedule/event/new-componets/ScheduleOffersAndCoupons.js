// import React, { useState, useEffect, useCallback } from "react";
// import {
//   Card,
//   Form,
//   Select,
//   Button,
//   Alert,
//   message,
//   Typography,
//   Space,
//   Tag,
//   Empty,
//   Spin,
// } from "antd";
// import {
//   TagOutlined,
//   PercentageOutlined,
//   GiftOutlined,
//   CalendarOutlined,
//   SaveOutlined,
//   CloseOutlined,
//   CheckOutlined,
// } from "@ant-design/icons";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   toggleSelectedOffer,
//   toggleSelectedCoupon,
//   updateSelectedOffer,
//   updateSelectedCoupons,
// } from "store/slices/scheduleSlice";
// import { fetchEventDetails } from "store/slices/eventSlice";
// import { debounce } from "lodash";
// import dayjs from "dayjs";
// import { OfferDateValidation } from "../utils/OfferDateValidation";

// const { Text } = Typography;
// const { Option } = Select;

// // Inline OfferItemCard Component
// const OfferItemCard = ({
//   item,
//   type,
//   onDelete,
//   onDateChange,
//   scheduleStartDate,
//   scheduleEndDate,
// }) => {
//   const [isEditingDate, setIsEditingDate] = useState(false);
//   const itemData = type === "offer" ? item.offer : item.coupons;

//   const getStatusColor = () => {
//     if (itemData.wasAdjusted) return "orange";
//     if (
//       !OfferDateValidation.isDateValid(
//         scheduleStartDate,
//         scheduleEndDate,
//         itemData.start_date,
//         itemData.end_date
//       )
//     )
//       return "red";
//     return "green";
//   };

//   const getStatusText = () => {
//     if (itemData.wasAdjusted) return "Dates Adjusted";
//     if (
//       !OfferDateValidation.isDateValid(
//         scheduleStartDate,
//         scheduleEndDate,
//         itemData.start_date,
//         itemData.end_date
//       )
//     )
//       return "Invalid Dates";
//     return "Valid";
//   };

//   const handleCopyCode = () => {
//     if (type === "coupon" && itemData.code) {
//       navigator.clipboard.writeText(itemData.code);
//       message.success("Coupon code copied to clipboard!");
//     }
//   };

//   return (
//     <Card
//       size="small"
//       className="hover:shadow-md transition-shadow duration-200 border border-gray-200 rounded-xl mb-3"
//       bodyStyle={{ padding: "16px" }}
//     >
//       <div className="space-y-3">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-2">
//             <div
//               className={`w-8 h-8 rounded-lg flex items-center justify-center ${
//                 type === "offer" ? "bg-orange-100" : "bg-green-100"
//               }`}
//             >
//               {type === "offer" ? (
//                 <TagOutlined
//                   className={`text-sm ${
//                     type === "offer" ? "text-orange-600" : "text-green-600"
//                   }`}
//                 />
//               ) : (
//                 <PercentageOutlined className="text-green-600 text-sm" />
//               )}
//             </div>
//             <div>
//               <p className="font-medium text-gray-900 text-sm truncate">
//                 {itemData.name}
//               </p>
//               <p className="text-xs text-gray-500">
//                 {type === "offer" ? "Offer" : "Coupon"}
//               </p>
//             </div>
//           </div>
//           <div className="flex items-center space-x-1">
//             <Button
//               type="text"
//               size="small"
//               onClick={() => onDateChange(item, type)}
//               className="hover:bg-blue-50 hover:text-blue-600"
//             >
//               Edit
//             </Button>
//             <Button
//               type="text"
//               size="small"
//               danger
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onDelete(item);
//               }}
//               className="hover:bg-red-50"
//             >
//               Remove
//             </Button>
//           </div>
//         </div>

//         {/* Status */}
//         <div className="flex items-center justify-between">
//           <Tag color={getStatusColor()} size="small" className="rounded">
//             {getStatusText()}
//           </Tag>
//           {type === "offer" && itemData.discount_value && (
//             <Tag color="green" size="small">
//               {itemData.discount_type === "percentage"
//                 ? `${itemData.discount_value}% OFF`
//                 : `$${itemData.discount_value} OFF`}
//             </Tag>
//           )}
//           {type === "coupon" && itemData.max_uses && (
//             <Tag color="blue" size="small">
//               Max Uses: {itemData.max_uses}
//             </Tag>
//           )}
//         </div>

//         {/* Coupon Code Display */}
//         {type === "coupon" && itemData.code && (
//           <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs text-gray-600 mb-1">Coupon Code</p>
//                 <p className="font-mono text-lg font-bold text-green-800 tracking-wider">
//                   {itemData.code}
//                 </p>
//               </div>
//               <Button
//                 type="text"
//                 size="small"
//                 onClick={handleCopyCode}
//                 className="hover:bg-white hover:text-green-600"
//               >
//                 Copy
//               </Button>
//             </div>
//           </div>
//         )}

//         {/* Date Range */}
//         <div className="bg-gray-50 rounded-lg p-2">
//           <div className="flex items-center justify-between text-xs">
//             <div className="flex items-center space-x-1">
//               <CalendarOutlined className="text-gray-500" />
//               <span className="text-gray-600">Start:</span>
//               <span className="font-medium">
//                 {itemData.start_date && dayjs(itemData.start_date).isValid()
//                   ? dayjs(itemData.start_date).format("MMM DD")
//                   : "N/A"}
//               </span>
//             </div>
//             <div className="flex items-center space-x-1">
//               <span className="text-gray-600">End:</span>
//               <span className="font-medium">
//                 {itemData.end_date && dayjs(itemData.end_date).isValid()
//                   ? dayjs(itemData.end_date).format("MMM DD")
//                   : "N/A"}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Warning for invalid/adjusted dates */}
//         {itemData.wasAdjusted && (
//           <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
//             <p className="text-xs text-orange-800 font-medium">
//               Dates were automatically adjusted to fit within schedule period
//             </p>
//           </div>
//         )}

//         {!OfferDateValidation.isDateValid(
//           scheduleStartDate,
//           scheduleEndDate,
//           itemData.start_date,
//           itemData.end_date
//         ) &&
//           !itemData.wasAdjusted && (
//             <div className="bg-red-50 border border-red-200 rounded-lg p-2">
//               <p className="text-xs text-red-800 font-medium">
//                 Invalid dates - will be adjusted automatically
//               </p>
//             </div>
//           )}
//       </div>
//     </Card>
//   );
// };

// // Inline DateChangeModal Component
// const DateChangeModal = ({
//   isVisible,
//   onClose,
//   onSave,
//   item,
//   scheduleStartDate,
//   scheduleEndDate,
// }) => {
//   const [form] = Form.useForm();

//   useEffect(() => {
//     if (isVisible && item) {
//       const itemData = item.offer ?? item.coupons;
//       if (
//         itemData &&
//         dayjs(itemData.start_date).isValid() &&
//         dayjs(itemData.end_date).isValid()
//       ) {
//         form.setFieldsValue({
//           start_date: dayjs(itemData.start_date),
//           end_date: dayjs(itemData.end_date),
//         });
//       }
//     } else {
//       form.resetFields();
//     }
//   }, [isVisible, item, form]);

//   const handleSave = async () => {
//     try {
//       const values = await form.validateFields();
//       const itemData = item.offer || item.coupons;

//       const originalDates = {
//         start_date: itemData.original_start_date || itemData.start_date,
//         end_date: itemData.original_end_date || itemData.end_date,
//       };

//       const validationResult = OfferDateValidation.validateDates({
//         startDate: values.start_date.format("YYYY-MM-DD"),
//         endDate: values.end_date.format("YYYY-MM-DD"),
//         scheduleStartDate,
//         scheduleEndDate,
//         originalItemDates: originalDates,
//         isRequired: true,
//         itemName: item.offer ? "Offer" : "Coupon",
//       });

//       if (!validationResult.isValid) {
//         message.error(validationResult.message);
//         return;
//       }

//       const datesToSave = validationResult.wasAdjusted
//         ? validationResult.adjustedDates
//         : {
//             start_date: values.start_date.format("YYYY-MM-DD"),
//             end_date: values.end_date.format("YYYY-MM-DD"),
//           };

//       if (validationResult.wasAdjusted) {
//         message.warning(validationResult.message);
//       }

//       const updatedData = {
//         start_date: datesToSave.start_date,
//         end_date: datesToSave.end_date,
//       };

//       if (item.offer) {
//         updatedData.id = item.offer.id;
//       } else if (item.coupons) {
//         updatedData.id = item.coupons.id;
//       }

//       if (validationResult.wasAdjusted || itemData.original_start_date) {
//         updatedData.original_start_date = originalDates.start_date;
//         updatedData.original_end_date = originalDates.end_date;
//       }

//       onSave(updatedData);
//       onClose();
//     } catch (error) {
//       console.error("Validation failed:", error);
//     }
//   };

//   const getDisabledDates = () => {
//     if (!item) return () => false;
//     const itemData = item.offer || item.coupons;
//     return OfferDateValidation.getDisabledDate(
//       scheduleStartDate,
//       scheduleEndDate,
//       {
//         start_date: itemData.original_start_date || itemData.start_date,
//         end_date: itemData.original_end_date || itemData.end_date,
//       }
//     );
//   };

//   return (
//     <Modal
//       title={`Change ${item?.offer ? "Offer" : "Coupon"} Date Range`}
//       open={isVisible}
//       onCancel={onClose}
//       footer={[
//         <Button key="cancel" onClick={onClose}>
//           Cancel
//         </Button>,
//         <Button key="save" type="primary" onClick={handleSave}>
//           Save
//         </Button>,
//       ]}
//     >
//       <Form form={form} layout="vertical">
//         <Form.Item
//           name="start_date"
//           label="Start Date"
//           rules={[
//             { required: true, message: "Please select start date" },
//             ({ getFieldValue }) => ({
//               validator(_, value) {
//                 if (!value) return Promise.resolve();
//                 const endDate = getFieldValue("end_date");
//                 if (endDate && value.isAfter(endDate, "day")) {
//                   return Promise.reject(
//                     new Error("Start date cannot be after end date")
//                   );
//                 }
//                 return Promise.resolve();
//               },
//             }),
//           ]}
//         >
//           <DatePicker
//             style={{ width: "100%" }}
//             disabledDate={getDisabledDates()}
//             format="YYYY-MM-DD"
//           />
//         </Form.Item>
//         <Form.Item
//           name="end_date"
//           label="End Date"
//           rules={[
//             { required: true, message: "Please select end date" },
//             ({ getFieldValue }) => ({
//               validator(_, value) {
//                 if (!value) return Promise.resolve();
//                 const startDate = getFieldValue("start_date");
//                 if (startDate && value.isBefore(startDate, "day")) {
//                   return Promise.reject(
//                     new Error("End date cannot be before start date")
//                   );
//                 }
//                 return Promise.resolve();
//               },
//             }),
//           ]}
//         >
//           <DatePicker
//             style={{ width: "100%" }}
//             disabledDate={getDisabledDates()}
//             format="YYYY-MM-DD"
//           />
//         </Form.Item>
//       </Form>
//     </Modal>
//   );
// };

// // Main ScheduleOffersAndCoupons Component
// export const ScheduleOffersAndCoupons = ({ form }) => {
//   const dispatch = useDispatch();
//   const [dateModalVisible, setDateModalVisible] = useState(false);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [itemType, setItemType] = useState(null);
//   const [offerSearchValue, setOfferSearchValue] = useState("");
//   const [couponSearchValue, setCouponSearchValue] = useState("");

//   const { eventDetails, loading } = useSelector((state) => state.event || {});
//   const { selectedOffers, selectedCoupons } = useSelector(
//     (state) => state.schedules || {}
//   );

//   // Get schedule dates from form
//   const scheduleStartDate = form?.getFieldValue("booking_start_date_time");
//   const scheduleEndDate = form?.getFieldValue("end_date");

//   useEffect(() => {
//     const eventId = form?.getFieldValue("event_id");
//     if (eventId) {
//       dispatch(fetchEventDetails(eventId));
//     }
//   }, [dispatch, form]);

//   // Get available offers and coupons
//   const availableOffers = eventDetails?.event_offers || [];
//   const availableCoupons = eventDetails?.event_coupons || [];

//   // Filter functions
//   const filteredOffers = availableOffers.filter((offer) =>
//     offer.offer.name.toLowerCase().includes(offerSearchValue.toLowerCase())
//   );

//   const filteredCoupons = availableCoupons.filter((coupon) =>
//     coupon.coupons.name.toLowerCase().includes(couponSearchValue.toLowerCase())
//   );

//   // Debounced search
//   const debouncedOfferSearch = useCallback(
//     debounce((value) => setOfferSearchValue(value), 300),
//     []
//   );

//   const debouncedCouponSearch = useCallback(
//     debounce((value) => setCouponSearchValue(value), 300),
//     []
//   );

//   const handleOfferSelect = (offerId) => {
//     if (!scheduleStartDate || !scheduleEndDate) {
//       message.error("Please select schedule dates before adding an offer");
//       return;
//     }

//     const selectedOffer = availableOffers.find(
//       (offer) => offer.offer.id === offerId
//     );

//     if (selectedOffer) {
//       const adjustedDates = OfferDateValidation.adjustDateToSchedule(
//         selectedOffer.offer.start_date,
//         selectedOffer.offer.end_date,
//         scheduleStartDate,
//         scheduleEndDate
//       );

//       if (!adjustedDates.isValid) {
//         message.error("Offer dates must be within event dates");
//         return;
//       }

//       const updatedOffer = {
//         ...selectedOffer,
//         offer: {
//           ...selectedOffer.offer,
//           start_date: adjustedDates.start_date,
//           end_date: adjustedDates.end_date,
//           original_start_date: selectedOffer.offer.start_date,
//           original_end_date: selectedOffer.offer.end_date,
//           wasAdjusted: adjustedDates.wasAdjusted,
//         },
//       };

//       dispatch(toggleSelectedOffer(updatedOffer));

//       if (adjustedDates.wasAdjusted) {
//         message.success(
//           `Dates adjusted to: ${dayjs(adjustedDates.start_date).format(
//             "YYYY-MM-DD"
//           )} - ${dayjs(adjustedDates.end_date).format("YYYY-MM-DD")}`
//         );
//       } else {
//         message.success(`Offer "${selectedOffer.offer.name}" added successfully`);
//       }
//     }
//   };

//   const handleCouponSelect = (couponId) => {
//     if (!scheduleStartDate || !scheduleEndDate) {
//       message.error("Please select schedule dates before adding a coupon");
//       return;
//     }

//     const selectedCoupon = availableCoupons.find(
//       (coupon) => coupon.id === couponId
//     );

//     if (selectedCoupon) {
//       const adjustedDates = OfferDateValidation.adjustDateToSchedule(
//         selectedCoupon.coupons.start_date,
//         selectedCoupon.coupons.end_date,
//         scheduleStartDate,
//         scheduleEndDate
//       );

//       if (!adjustedDates.isValid) {
//         message.error("Coupon dates must be within event dates");
//         return;
//       }

//       const updatedCoupon = {
//         ...selectedCoupon,
//         coupons: {
//           ...selectedCoupon.coupons,
//           start_date: adjustedDates.start_date,
//           end_date: adjustedDates.end_date,
//           original_start_date: selectedCoupon.coupons.start_date,
//           original_end_date: selectedCoupon.coupons.end_date,
//           wasAdjusted: adjustedDates.wasAdjusted,
//         },
//       };

//       dispatch(toggleSelectedCoupon(updatedCoupon));

//       if (adjustedDates.wasAdjusted) {
//         message.success(
//           `Dates adjusted to: ${dayjs(adjustedDates.start_date).format(
//             "YYYY-MM-DD"
//           )} - ${dayjs(adjustedDates.end_date).format("YYYY-MM-DD")}`
//         );
//       } else {
//         message.success(`Coupon "${selectedCoupon.coupons.name}" added successfully`);
//       }
//     }
//   };

//   const handleOfferDelete = (offer) => {
//     dispatch(toggleSelectedOffer(offer));
//     message.success("Offer removed successfully");
//   };

//   const handleCouponDelete = (coupon) => {
//     dispatch(toggleSelectedCoupon(coupon));
//     message.success("Coupon removed successfully");
//   };

//   const handleDateChange = (item, type) => {
//     setSelectedItem(item);
//     setItemType(type);
//     setDateModalVisible(true);
//   };

//   const handleDateSave = (dates) => {
//     if (!scheduleStartDate || !scheduleEndDate) {
//       message.error("Schedule dates are required");
//       return;
//     }

//     const adjustedDates = OfferDateValidation.adjustDateToSchedule(
//       dates.start_date,
//       dates.end_date,
//       scheduleStartDate,
//       scheduleEndDate
//     );

//     if (!adjustedDates.isValid) {
//       message.error("Selected dates must be within schedule dates");
//       return;
//     }

//     if (itemType === "offer") {
//       dispatch(
//         updateSelectedOffer({
//           id: selectedItem.offer.id,
//           start_date: adjustedDates.start_date,
//           end_date: adjustedDates.end_date,
//           wasAdjusted: adjustedDates.wasAdjusted,
//         })
//       );
//     } else {
//       dispatch(
//         updateSelectedCoupons({
//           id: selectedItem.coupons.id,
//           start_date: adjustedDates.start_date,
//           end_date: adjustedDates.end_date,
//           wasAdjusted: adjustedDates.wasAdjusted,
//         })
//       );
//     }

//     setDateModalVisible(false);
//     setSelectedItem(null);
//     setItemType(null);

//     if (adjustedDates.wasAdjusted) {
//       message.success(
//         `Dates adjusted to: ${dayjs(adjustedDates.start_date).format(
//           "YYYY-MM-DD"
//         )} - ${dayjs(adjustedDates.end_date).format("YYYY-MM-DD")}`
//       );
//     } else {
//       message.success("Dates updated successfully");
//     }
//   };

//   const handleReset = () => {
//     // Clear all selected items
//     selectedOffers.forEach(offer => dispatch(toggleSelectedOffer(offer)));
//     selectedCoupons.forEach(coupon => dispatch(toggleSelectedCoupon(coupon)));
    
//     setOfferSearchValue("");
//     setCouponSearchValue("");
//     message.info("All offers and coupons have been removed");
//   };

//   const hasValidScheduleDates = scheduleStartDate && scheduleEndDate;

//   return (
//     <div className="max-w-full m-6 bg-white rounded-xl shadow-md border border-gray-200">
//       {/* Header */}
//       <div className="flex items-center justify-between p-6 border-b border-gray-200">
//         <div className="flex items-center space-x-3">
//           <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
//             <GiftOutlined className="w-6 h-6 text-white" />
//           </div>
//           <div>
//             <h1 className="text-xl font-semibold text-gray-900">
//               Offers & Coupons
//             </h1>
//             <p className="text-sm text-gray-600">
//               Manage promotional offers and discount coupons for your event (Optional)
//             </p>
//           </div>
//         </div>
//         <div className="flex items-center space-x-3">
//           <Button
//             icon={<CloseOutlined />}
//             onClick={handleReset}
//             className="flex items-center"
//           >
//             Reset All
//           </Button>
//           <Button
//             type="primary"
//             icon={<SaveOutlined />}
//             className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 hover:from-purple-700 hover:to-pink-700"
//             onClick={() => message.success("Configuration saved successfully!")}
//           >
//             Save Configuration
//           </Button>
//         </div>
//       </div>

//       <div className="p-6">
//         {/* Schedule Date Warning */}
//         {!hasValidScheduleDates && (
//           <Alert
//             message="Schedule Dates Required"
//             description="Please set your event schedule dates first before adding offers and coupons. Dates will be automatically validated and adjusted to fit within your schedule period."
//             type="warning"
//             showIcon
//             className="mb-6"
//           />
//         )}

//         {/* Schedule Date Info */}
//         {hasValidScheduleDates && (
//           <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-6">
//             <div className="flex items-center space-x-2 mb-2">
//               <CalendarOutlined className="text-blue-600" />
//               <span className="text-sm font-medium text-blue-800">
//                 Schedule Period
//               </span>
//             </div>
//             <p className="text-sm text-blue-700">
//               {dayjs(scheduleStartDate).format("MMM DD, YYYY")} -{" "}
//               {dayjs(scheduleEndDate).format("MMM DD, YYYY")}
//             </p>
//             <p className="text-xs text-blue-600 mt-1">
//               All offers and coupons will be automatically adjusted to fit within this period
//             </p>
//           </div>
//         )}

//         <div className="grid grid-cols-12 gap-6">
//           {/* Left Section - Selection */}
//           <div className="col-span-8 space-y-6">
//             {/* Offers Section */}
//             <Card title="Available Offers" className="h-full">
//               <Form layout="vertical">
//                 <Form.Item name="offer" label="Select Offer">
//                   <Select
//                     showSearch
//                     placeholder="Search and select offers"
//                     loading={loading}
//                     onSearch={debouncedOfferSearch}
//                     onChange={handleOfferSelect}
//                     allowClear
//                     size="large"
//                     disabled={!hasValidScheduleDates}
//                     dropdownStyle={{
//                       borderRadius: "12px",
//                       boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
//                     }}
//                     filterOption={(input, option) =>
//                       option?.label
//                         ?.toLowerCase()
//                         .includes(input.toLowerCase())
//                     }
//                     notFoundContent={
//                       loading ? (
//                         <div className="text-center py-4">
//                           <Spin size="small" />
//                           <div className="mt-2 text-gray-500">
//                             Loading offers...
//                           </div>
//                         </div>
//                       ) : (
//                         <Empty
//                           description="No offers found"
//                           image={Empty.PRESENTED_IMAGE_SIMPLE}
//                         />
//                       )
//                     }
//                   >
//                     {filteredOffers.map((offer) => (
//                       <Option
//                         key={offer.offer.id}
//                         value={offer.offer.id}
//                         label={offer.offer.name}
//                       >
//                         <div className="py-2">
//                           <div className="flex items-center justify-between">
//                             <div className="flex items-center space-x-3">
//                               <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
//                                 <TagOutlined className="text-orange-600 text-sm" />
//                               </div>
//                               <div>
//                                 <div className="font-medium text-gray-900">
//                                   {offer.offer.name}
//                                 </div>
//                                 {offer.offer.description && (
//                                   <div className="text-xs text-gray-500 truncate">
//                                     {offer.offer.description}
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                             <div className="text-right">
//                               {offer.offer.discount_value && (
//                                 <div className="text-sm font-medium text-green-600">
//                                   {offer.offer.discount_type === "percentage"
//                                     ? `${offer.offer.discount_value}% OFF`
//                                     : `$${offer.offer.discount_value} OFF`}
//                                 </div>
//                               )}
//                               <div className="text-xs text-gray-500">
//                                 {dayjs(offer.offer.start_date).format("MMM DD")} -{" "}
//                                 {dayjs(offer.offer.end_date).format("MMM DD")}
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </Option>
//                     ))}
//                   </Select>
//                 </Form.Item>

//                 {/* Coupons Section */}
//                 <Form.Item name="coupon" label="Select Coupon">
//                   <Select
//                     showSearch
//                     placeholder="Search and select coupons"
//                     loading={loading}
//                     onSearch={debouncedCouponSearch}
//                     onChange={handleCouponSelect}
//                     allowClear
//                     size="large"
//                     disabled={!hasValidScheduleDates}
//                     dropdownStyle={{
//                       borderRadius: "12px",
//                       boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
//                     }}
//                     filterOption={(input, option) =>
//                       option?.label
//                         ?.toLowerCase()
//                         .includes(input.toLowerCase())
//                     }
//                     notFoundContent={
//                       loading ? (
//                         <div className="text-center py-4">
//                           <Spin size="small" />
//                           <div className="mt-2 text-gray-500">
//                             Loading coupons...
//                           </div>
//                         </div>
//                       ) : (
//                         <Empty
//                           description="No coupons found"
//                           image={Empty.PRESENTED_IMAGE_SIMPLE}
//                         />
//                       )
//                     }
//                   >
//                     {filteredCoupons.map((coupon) => (
//                       <Option
//                         key={coupon.id}
//                         value={coupon.id}
//                         label={coupon.coupons.name}
//                       >
//                         <div className="py-2">
//                           <div className="flex items-center justify-between">
//                             <div className="flex items-center space-x-3">
//                               <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
//                                 <PercentageOutlined className="text-green-600 text-sm" />
//                               </div>
//                               <div>
//                                 <div className="font-medium text-gray-900">
//                                   {coupon.coupons.name}
//                                 </div>
//                                 <div className="text-xs text-gray-500">
//                                   Code: {coupon.coupons.code}
//                                 </div>
//                               </div>
//                             </div>
//                             <div className="text-right">
//                               <div className="text-sm font-medium text-blue-600">
//                                 Max Uses: {coupon.coupons.max_uses}
//                               </div>
//                               <div className="text-xs text-gray-500">
//                                 {dayjs(coupon.coupons.start_date).format("MMM DD")} -{" "}
//                                 {dayjs(coupon.coupons.end_date).format("MMM DD")}
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </Option>
//                     ))}
//                   </Select>
//                 </Form.Item>
//               </Form>

//               {/* General Warning */}
//               <Alert
//                 message="Auto-Adjustment Notice"
//                 description="Offers and coupons will be automatically adjusted to match your scheduled time period. You can modify dates after selection if needed."
//                 type="info"
//                 showIcon
//                 className="mt-4"
//               />
//             </Card>
//           </div>

//           {/* Right Section - Selected Items */}
//           <div className="col-span-4 space-y-6">
//             {/* Selected Offers */}
//             {selectedOffers.length > 0 && (
//               <div>
//                 <div className="flex items-center space-x-2 mb-4">
//                   <CheckOutlined className="text-green-500" />
//                   <Text strong>Selected Offers ({selectedOffers.length})</Text>
//                 </div>
//                 <div className="max-h-96 overflow-y-auto">
//                   {selectedOffers.map((offer) => (
//                     <OfferItemCard
//                       key={offer.id}
//                       item={offer}
//                       type="offer"
//                       onDelete={handleOfferDelete}
//                       onDateChange={handleDateChange}
//                       scheduleStartDate={scheduleStartDate}
//                       scheduleEndDate={scheduleEndDate}
//                     />
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Selected Coupons */}
//             {selectedCoupons.length > 0 && (
//               <div>
//                 <div className="flex items-center space-x-2 mb-4">
//                   <CheckOutlined className="text-green-500" />
//                   <Text strong>Selected Coupons ({selectedCoupons.length})</Text>
//                 </div>
//                 <div className="max-h-96 overflow-y-auto">
//                   {selectedCoupons.map((coupon) => (
//                     <OfferItemCard
//                       key={coupon.id}
//                       item={coupon}
//                       type="coupon"
//                       onDelete={handleCouponDelete}
//                       onDateChange={handleDateChange}
//                       scheduleStartDate={scheduleStartDate}
//                       scheduleEndDate={scheduleEndDate}
//                     />
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Empty State */}
//             {selectedOffers.length === 0 && selectedCoupons.length === 0 && (
//               <div className="text-center py-8">
//                 <GiftOutlined className="text-4xl text-gray-300 mb-4" />
//                 <p className="text-gray-500 mb-2">No items selected</p>
//                 <p className="text-sm text-gray-400">
//                   Select offers and coupons from the left panel
//                 </p>
//               </div>
//             )}

//             {/* Summary */}
//             {(selectedOffers.length > 0 || selectedCoupons.length > 0) && (
//               <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
//                 <h4 className="text-sm font-medium text-gray-800 mb-3">
//                   Selection Summary
//                 </h4>
//                 <div className="space-y-2 text-sm">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Total Offers:</span>
//                     <span className="font-medium">{selectedOffers.length}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Total Coupons:</span>
//                     <span className="font-medium">{selectedCoupons.length}</span>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Date Change Modal */}
//       <DateChangeModal
//         isVisible={dateModalVisible}
//         onClose={() => {
//           setDateModalVisible(false);
//           setSelectedItem(null);
//           setItemType(null);
//         }}
//         onSave={handleDateSave}
//         item={selectedItem}
//         scheduleStartDate={scheduleStartDate}
//         scheduleEndDate={scheduleEndDate}
//       />
//     </div>
//   );
// };

// export default ScheduleOffersAndCoupons;
