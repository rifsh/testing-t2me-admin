import { uploadToR2, getFromR2 } from "../configs/R2BucketConfig";
import { ApiConstant } from "constants/ApiConstant";
import { CDN_ASSETS_PATH } from "configs/AppConfig";
import fetch from "auth/FetchInterceptor";

const FaqService = {};

FaqService.getFaqs = async function () {
  try {
    console.log("FETCHING FAQS");

    const response = await window.fetch(
      `${CDN_ASSETS_PATH}${ApiConstant.BUCKET_FAQ_KEY}`,
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

FaqService.createFaq = async function (data) {
  try {
    // Step 1: Get presigned URL
    const presignedResponse = await fetch({
      url: ApiConstant.GENERATE_PRESIGNED_URL_LAYOUT_JSON,
      method: "get",
      params: {
        module_name: "faq",
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

export default FaqService;
