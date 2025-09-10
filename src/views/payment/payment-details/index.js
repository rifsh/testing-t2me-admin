import { CDN_PATH } from "configs/AppConfig";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getSinglePayment } from "store/slices/paymentSlice";

const PaymentDetails = () => {
  const dispatch = useDispatch();
  const { paymentId } = useParams();
  const { singlePayment, loading, error } = useSelector(
    (state) => state.payment
  );
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Requesting Payment ID:", paymentId);
    if (paymentId) {
      dispatch(getSinglePayment({ payment_id: paymentId }));
    }
  }, [dispatch, paymentId]);

  useEffect(() => {
    console.log("Current Payment State:", { singlePayment, loading, error });
  }, [singlePayment, loading, error]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-sm max-w-md w-full mx-4">
          <div className="text-red-500 text-center">
            <h3 className="font-semibold mb-2">Error</h3>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!singlePayment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-sm max-w-md w-full mx-4">
          <div className="text-center">
            <h3 className="font-semibold mb-2 text-gray-900">
              No Payment Details Found
            </h3>
            <p className="text-sm text-gray-600">
              The requested payment could not be found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const paymentData = singlePayment;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            onClick={() => {
              navigate(-1);
            }}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Go Back
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">
            Payment Details
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Basic Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Payment ID
                  </label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">
                    {paymentData.id}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <p className="mt-1">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        paymentData.status
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {paymentData.status ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Created
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(paymentData.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Updated
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(paymentData.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Location Details */}
            {paymentData.place && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Location
                </h2>
                <div className="flex items-start space-x-4">
                  {paymentData.place.thumbnail_image && (
                    <img
                      src={`${CDN_PATH}/${paymentData.place.thumbnail_image}`}
                      alt={paymentData.place.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {paymentData.place.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {paymentData.place.country?.name}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Timezone:</span>
                        <span className="ml-2 text-gray-900">
                          {paymentData.place.country?.time_zone}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Currency:</span>
                        <span className="ml-2 text-gray-900 font-mono">
                          {paymentData.place.country?.currency_code}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Add-on Services */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Add-on Services
              </h2>
              {paymentData.add_on_services?.length > 0 ? (
                <div className="space-y-4">
                  {paymentData.add_on_services.map((service, index) => (
                    <div
                      key={service.id || index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">
                          {service.service_name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-semibold text-gray-900">
                            {service.is_percentage
                              ? `${service.percentage_or_amount}%`
                              : `$${service.percentage_or_amount}`}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              service.visibility_status
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {service.visibility_status ? "Visible" : "Hidden"}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {service.description}
                      </p>
                      {service.service_features?.length > 0 && (
                        <ul className="text-sm text-gray-600 space-y-1">
                          {service.service_features.map(
                            (feature, featureIndex) => (
                              <li
                                key={featureIndex}
                                className="flex items-start"
                              >
                                <span className="text-gray-400 mr-2">•</span>
                                {feature}
                              </li>
                            )
                          )}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No add-on services configured
                </p>
              )}
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Payment Methods
              </h2>
              {paymentData.payment_methods?.length > 0 ? (
                <div className="space-y-4">
                  {paymentData.payment_methods.map((method, index) => (
                    <div
                      key={method.id || index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">
                          {method.payment_type}
                        </h3>
                        <span className="text-lg font-semibold text-gray-900">
                          {method.is_percentage
                            ? `${method.payment_charge}%`
                            : `$${method.payment_charge}`}
                        </span>
                      </div>

                      {method.authorized_url && (
                        <div className="mb-3">
                          <label className="text-sm font-medium text-gray-500">
                            API Endpoint
                          </label>
                          <p className="mt-1 text-sm text-gray-900 font-mono break-all">
                            {method.authorized_url}
                          </p>
                        </div>
                      )}

                      {method.additional_details && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 mb-2 block">
                            Configuration
                          </label>
                          <div className="bg-gray-50 rounded-md p-3 space-y-2">
                            {Object.entries(method.additional_details).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="flex justify-between text-sm"
                                >
                                  <span className="text-gray-600 capitalize">
                                    {key.replace(/_/g, " ")}:
                                  </span>
                                  <span className="text-gray-900 font-mono text-right break-all ml-4">
                                    {value}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No payment methods configured
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Terms & Conditions */}
            {paymentData.terms_and_conditions && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Terms & Conditions
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed truncate">
                  {paymentData.terms_and_conditions}
                </p>
              </div>
            )}

            {/* Additional Resources */}
            {paymentData.additional_urls && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Additional Resources
                </h3>
                <a
                  href={paymentData.additional_urls}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm break-all underline"
                >
                  {paymentData.additional_urls}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;
