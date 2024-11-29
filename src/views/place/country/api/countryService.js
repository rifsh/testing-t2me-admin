import axios from "axios";
import { API_BASE_URL } from "constants/ApiConstant";

export const fetchCountry = async (token) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/location/secured/country`,
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzaGFtaWw3MDdAZ21haWwuY29tIiwiZXhwIjoxNzM1MTExMjE3fQ.LMJ9_uRgNPkZ8KA2iznWiL87RS0ilioo5jAemWq_e30`,
          },
        }
      );
      console.log("API Response: ", response.data); 
      return response.data;
    } catch (error) {
      console.error("Error fetching countries:", error);
      throw error;
    }
  };
  