import { uploadToR2, getFromR2 } from "../configs/R2BucketConfig";
import { ApiConstant } from "constants/ApiConstant";

const FaqService = {
  getFaqs: async () => {
    try {
      const faqData = await getFromR2(ApiConstant.BUCKET_FAQ_KEY);
      console.log("FAQs fetched successfully:", faqData);
      return faqData;
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      throw error;
    }
  },

  uploadFaqToR2: async (jsonData) => {
    try {
      const response = await uploadToR2(ApiConstant.BUCKET_FAQ_KEY, jsonData);
      console.log("FAQs uploaded successfully:", response);
      return response;
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  },
};

export default FaqService;
