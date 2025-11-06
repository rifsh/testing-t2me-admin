import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { CDN_ASSETS_PATH } from "configs/AppConfig";

const AuthService = {};
AuthService.login = function (data) {
  return fetch({
    url: ApiConstant.LOGIN,
    method: "post",
    data: data,
  });
};
AuthService.logout = function () {
  return fetch({
    url: ApiConstant.LOG_OUT,
    method: "post",
  });
};
AuthService.register = function (data) {
  const formData = Utils.createFormData(data, {
    fileKeys: ["thumbnail_image"],
    skipEmpty: true,
  });

  return fetch({
    url: ApiConstant.LEAD_REGISTER,
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
AuthService.verifyOtp = function (data) {
  return fetch({
    url: ApiConstant.LEAD_OTP_VERIFY,
    method: "put",
    data: data,
  });
};

AuthService.ResendOtp = function (data) {
  return fetch({
    url: ApiConstant.LEAD_OTP_RESEND,
    method: "post",
    data: data,
  });
};

AuthService.TermsCondition = async function () {
  try {
    console.log("FETCHING TERMS AND CONDITIONS");

    const response = await window.fetch(
      `${CDN_ASSETS_PATH}${ApiConstant.BUCKET_TERMS_KEY}`,
      {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    throw new Error(error.message || "Failed to fetch FAQs");
  }
};

AuthService.PostTermsCondition = async function (data) {
  try {
    // Step 1: Get presigned URL
    const presignedResponse = await fetch({
      url: ApiConstant.GENERATE_PRESIGNED_URL_LAYOUT_JSON,
      method: "get",
      params: {
        module_name: "terms",
      },
    });

    if (!presignedResponse?.data?.[0]?.upload_url) {
      throw new Error("Failed to get presigned URL");
    }

    const { upload_url, public_url } = presignedResponse.data[0];

    // Step 2: Upload the FAQ data to the presigned URL
    const uploadResponse = await window.fetch(upload_url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed with status: ${uploadResponse.status}`);
    }

    // Return the uploaded data for consistency with Redux state updates
    return {
      data: data,
      public_url: public_url,
      status: {
        message: "FAQ uploaded successfully",
        status_code: "00000",
      },
    };
  } catch (error) {
    console.error("Error creating FAQ:", error);
    throw new Error(error.message || "Failed to create FAQ");
  }
};

// AuthService.PostTermsCondition = function (data) {
//   return fetch({
//     url: ApiConstant.POTS_TERMS_AND_CONDITION,
//     method: "put",
//     data: data,
//   });
// };

export default AuthService;
