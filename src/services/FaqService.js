import axios from "axios"; // Import Axios
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const FaqService = {
  getFaqs: async () => {
    try {
      const response = await axios.get(ApiConstant.FAQ_URL);

      return response.data;
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      throw error;
    }
  },
};

export default FaqService;
