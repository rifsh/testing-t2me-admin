import { ApiConstant } from "constants/ApiConstant";
import fetch from "auth/FetchInterceptor";
import Utils from "utils";
import { CDN_ASSETS_PATH } from "configs/AppConfig";

const FooterService = {};

FooterService.getFooterData = async function () {
  try {
    console.log("FETCHING FOOTER");

    const response = await window.fetch(
      `${CDN_ASSETS_PATH}${ApiConstant.BUCKET_FOOTER_KEY}`,
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

FooterService.uploadImageToCdn = async function (file, moduleName = "footer") {
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

FooterService.createFooter = async function (data) {
  try {
    console.log("Creating footer with data:", data);

    // Step 1: Get presigned URL for JSON upload
    const presignedResponse = await fetch({
      url: ApiConstant.GENERATE_PRESIGNED_URL_LAYOUT_JSON,
      method: "get",
      params: {
        module_name: "footer",
      },
    });

    if (!presignedResponse?.data?.[0]?.upload_url) {
      throw new Error("Failed to get presigned URL");
    }

    const { upload_url, public_url } = presignedResponse.data[0];

    // Step 2: First, fetch existing footer data
    let existingFooterData = {};
    try {
      const response = await window.fetch(
        `${CDN_ASSETS_PATH}${ApiConstant.BUCKET_FOOTER_KEY}`,
        {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
      if (response.ok) {
        existingFooterData = await response.json();
      }
    } catch (error) {
      console.log("No existing footer data found, creating new");
    }

    // Step 3: Structure the new footer data
    const locationKey = data.customer_support_keys; // e.g., "Dubai, UAE_1"

    // Initialize structure if it doesn't exist
    if (!existingFooterData.customer_support) {
      existingFooterData = {
        footer_text: "",
        app_logo_url: "",
        platform_description: "",
        customer_support: {},
        accepted_payment_methods: {},
        contact_us: {},
        support_hours: {},
      };
    }

    // Update general fields (if not location-specific)
    existingFooterData.footer_text =
      data.footer_text || existingFooterData.footer_text;
    existingFooterData.app_logo_url =
      data.app_logo || existingFooterData.app_logo_url;
    existingFooterData.platform_description =
      data.platform_description || existingFooterData.platform_description;

    // Add location-specific customer support
    existingFooterData.customer_support[locationKey] = {
      whatsapp_contact: data.whatsapp_contact || "",
      customer_support: {
        hotline_number: data.hotline_number || "",
        availability: data.availability || "",
      },
    };

    // Add location-specific payment methods
    if (data.payment_logos && Array.isArray(data.payment_logos)) {
      existingFooterData.accepted_payment_methods[locationKey] =
        data.payment_logos.map((pm) => ({
          method_name: pm.method_name || "",
          method_logo: pm.method_logo || "",
        }));
    }

    // Add location-specific contact us
    existingFooterData.contact_us[locationKey] = {
      heading: data.contact_heading || "",
      subheading: data.contact_subheading || "",
      whatsapp_support: {
        button_text: data.whatsapp_button_text || "",
        is_enabled: data.whatsapp_enabled !== false,
      },
    };

    // Add location-specific support hours
    existingFooterData.support_hours[locationKey] = {
      days_available: data.days_available || "",
      operating_hours: data.operating_hours || "",
    };

    // Step 4: Upload the structured data to the presigned URL
    const uploadResponse = await window.fetch(upload_url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(existingFooterData),
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed with status: ${uploadResponse.status}`);
    }

    console.log("Footer uploaded successfully:", public_url);

    return {
      data: existingFooterData,
      public_url: public_url,
      status: {
        message: "Footer uploaded successfully",
        status_code: "00000",
      },
    };
  } catch (error) {
    console.error("Error creating footer:", error);
    throw new Error(error.message || "Failed to create footer");
  }
};

export default FooterService;
