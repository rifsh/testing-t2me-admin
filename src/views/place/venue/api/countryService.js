import axios from 'axios';
import { API_BASE_URL } from 'constants/ApiConstant';




export const venueCountries = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/countries`);
        return response.data;
    } catch (error) {
        console.error('Error fetching countries:', error);
        throw error;
    }
};
