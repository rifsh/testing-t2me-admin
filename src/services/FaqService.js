import { uploadToR2, getFromR2 } from "../configs/R2BucketConfig";
import { ApiConstant } from "constants/ApiConstant";
import fetch from "auth/FetchInterceptor";
// const FaqService = {
//   getFaqs: async () => {
//     try {
//       const faqData = await getFromR2(ApiConstant.BUCKET_FAQ_KEY);
//       console.log("FAQs fetched successfully:", faqData);
//       return faqData;
//     } catch (error) {
//       console.error("Error fetching FAQs:", error);
//       throw error;
//     }
//   },

//   uploadFaqToR2: async (jsonData) => {
//     try {
//       const response = await uploadToR2(ApiConstant.BUCKET_FAQ_KEY, jsonData);
//       console.log("FAQs uploaded successfully:", response);
//       return response;
//     } catch (error) {
//       console.error("Upload failed:", error);
//       throw error;
//     }
//   },
// };

const FaqService = {};

FaqService.getFaqs = function () {
  console.log("FETCHING FAQS");

  return fetch({
    url: `${ApiConstant.FAQ_GET_URL}`,
    method: "get",
  });
};

FaqService.createFaq = function (data) {
  return fetch({
    url: `${ApiConstant.FAQ_UPLOAD_URL}`,
    method: "put",
    data: data,
  });
};

export default FaqService;
