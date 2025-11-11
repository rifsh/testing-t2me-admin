import { ApiConstant } from "constants/ApiConstant";
import fetch from "auth/FetchInterceptor";
import Utils from "utils";
import { CDN_ASSETS_PATH } from "configs/AppConfig";

const AppInfoService = {};

AppInfoService.getInfo = async function () {
  try {
    console.log("FETCHING GET INFOS");

    const response = await window.fetch(
      `${CDN_ASSETS_PATH}${ApiConstant.BUCKET_INFO_KEY}`,
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

AppInfoService.uploadImageToCdn = async function (file, moduleName = "info") {
  try {
    console.log("Uploading image to CDN:", file.name);
    const presignedResponse = await fetch({
      url: ApiConstant.GENERATE_PRESIGNED_MEDIA_URL,
      method: "get",
      params: {
        module_name: moduleName,
        media_type: "image",
        file_name: file.name,
      },
    });

    if (!presignedResponse?.data?.[0]?.upload_url) {
      throw new Error("Failed to get presigned URL");
    }

    const { upload_url, public_url, key } = presignedResponse.data[0];

    const uploadResponse = await window.fetch(upload_url, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "image/jpeg",
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed with status: ${uploadResponse.status}`);
    }

    console.log("Image uploaded successfully:", public_url);
    return {
      public_url: public_url,
      key: key,
      status: {
        message: "Image uploaded successfully",
        status_code: "00000",
      },
    };
  } catch (error) {
    console.error("Error uploading image to CDN:", error);
    throw new Error(error.message || "Failed to upload image to CDN");
  }
};

AppInfoService.updateInfo = async function (data) {
  try {
    // Step 1: Get presigned URL
    const presignedResponse = await fetch({
      url: ApiConstant.GENERATE_PRESIGNED_URL_LAYOUT_JSON,
      method: "get",
      params: {
        module_name: "info",
      },
    });

    if (!presignedResponse?.data?.[0]?.upload_url) {
      throw new Error("Failed to get presigned URL");
    }

    const { upload_url, public_url } = presignedResponse.data[0];

    // Step 2: Structure the data in the correct format
    const structuredData = {
      details: {
        under_maintenance: {
          enabled: data.enabled ?? false,
          footer_message: data.footer_message || "",
          maintenance_image: data.maintenance_image || null,
          reason_for_maintenance: data.reason_for_maintenance || "",
          playstore_url: data.playstore_url || "",
          appstore_url: data.appstore_url || "",
          isComingSoonFlag: data.isComingSoonFlag ?? false,
          isComingSoonMessage: data.isComingSoonMessage || "",
          isComingSoonImage: data.isComingSoonImage || null,
          banner: Array.isArray(data.banner) ? data.banner : [],
          home_title: data.home_title || null,
          home_subtitle: data.home_subtitle || null,
        },
      },
    };

    // Step 3: Upload the structured data to the presigned URL
    const uploadResponse = await window.fetch(upload_url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(structuredData),
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed with status: ${uploadResponse.status}`);
    }

    // Return the uploaded data for consistency with Redux state updates
    return {
      data: structuredData,
      public_url: public_url,
      status: {
        message: "Info uploaded successfully",
        status_code: "00000",
      },
    };
  } catch (error) {
    console.error("Error updating info:", error);
    throw new Error(error.message || "Failed to update info");
  }
};

export default AppInfoService;
