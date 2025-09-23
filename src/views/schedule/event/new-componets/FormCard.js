import React, { useState } from "react";

const FormCard = ({ onSubmit }) => {
  const [allowMultipleDates, setAllowMultipleDates] = useState(false);
  const [limitBookingsPerUser, setLimitBookingsPerUser] = useState(false);
  const [isPaymentRequired, setIsPaymentRequired] = useState(false);

  return (
    <div className="max-w-full m-6 bg-white rounded-3xl shadow-md border border-gray-200">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">Event Schedule</h1>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
            <span>×</span>
            <span>Cancel</span>
          </button>
          <button
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            onClick={() => {
              onSubmit();
            }}
          >
            <span>+</span>
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Form Fields */}
          <div className="col-span-8 space-y-8">
            {/* Basic Information Section */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Basic Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter schedule name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event
                  </label>
                  <input
                    type="text"
                    placeholder="Enter event name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue
                  </label>
                  <input
                    type="text"
                    placeholder="Enter venue"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking Type
                  </label>
                  <div className="relative">
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none">
                      <option>Select booking type</option>
                      <option>Single Event</option>
                      <option>Recurring Event</option>
                      <option>Multi-day Event</option>
                    </select>
                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Settings Section */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Ticket Settings
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Tickets Per Booking
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Enter max tickets"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking Limit Per User
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder={
                        limitBookingsPerUser
                          ? "Enter booking limit"
                          : "Enable 'Limit Bookings Per User' first"
                      }
                      disabled={!limitBookingsPerUser}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none ${
                        limitBookingsPerUser
                          ? "focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-4 space-y-6">
            {/* Booking Settings Section */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Booking Settings
              </h2>
              <div className="space-y-3">
                {/* Allow Multiple Dates Booking */}
                <div
                  onClick={() => setAllowMultipleDates(!allowMultipleDates)}
                  className={`p-3 rounded-3xl flex items-center justify-between cursor-pointer transition-all duration-200 ${
                    allowMultipleDates
                      ? "bg-green-50 border-2 border-green-200"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded flex items-center justify-center ${
                        allowMultipleDates ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="white"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          allowMultipleDates
                            ? "text-green-900"
                            : "text-gray-900"
                        }`}
                      >
                        Allow Multiple Dates Booking
                      </p>
                      <p
                        className={`text-xs ${
                          allowMultipleDates
                            ? "text-green-700"
                            : "text-gray-500"
                        }`}
                      >
                        Enable custom booking for multiple days
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {allowMultipleDates ? (
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                    )}
                  </div>
                </div>

                {/* Limit Bookings Per User */}
                <div
                  onClick={() => setLimitBookingsPerUser(!limitBookingsPerUser)}
                  className={`p-3 rounded-3xl flex items-center justify-between cursor-pointer transition-all duration-200 ${
                    limitBookingsPerUser
                      ? "bg-green-50 border-2 border-green-200"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded flex items-center justify-center ${
                        limitBookingsPerUser ? "bg-green-500" : "bg-blue-500"
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="white"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          limitBookingsPerUser
                            ? "text-green-900"
                            : "text-gray-900"
                        }`}
                      >
                        Limit Bookings Per User
                      </p>
                      <p
                        className={`text-xs ${
                          limitBookingsPerUser
                            ? "text-green-700"
                            : "text-gray-500"
                        }`}
                      >
                        Set booking limitations per user account
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {limitBookingsPerUser ? (
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                    )}
                  </div>
                </div>

                {/* Is Payment Required */}
                <div
                  onClick={() => setIsPaymentRequired(!isPaymentRequired)}
                  className={`p-3 rounded-3xl flex items-center justify-between cursor-pointer transition-all duration-200 ${
                    isPaymentRequired
                      ? "bg-green-50 border-2 border-green-200"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded flex items-center justify-center ${
                        isPaymentRequired ? "bg-green-500" : "bg-green-500"
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="white"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          isPaymentRequired ? "text-green-900" : "text-gray-900"
                        }`}
                      >
                        Is Payment Required
                      </p>
                      <p
                        className={`text-xs ${
                          isPaymentRequired ? "text-green-700" : "text-gray-500"
                        }`}
                      >
                        Enable payment requirement for bookings
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isPaymentRequired ? (
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Add On Service Section */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Add On Service
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Addons
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Enter addon price"
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FormCard;
