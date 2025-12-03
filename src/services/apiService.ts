import axios from "axios";
import { getItemFromSessionStorage } from "./utils";
import {APIMethod} from "../constants/api-endpoints"
import { useStore } from "./store";


const getAuthToken = () => {
    const state = useStore.getState()
    return state.authToken
}

const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { 'Authorization': token } : {};
};

const apiService = async (method: APIMethod, base_url: string, url: string, data = {}, customHeaders = {}, query_params = {}) => {
  try {

    const finalHeaders = {
      ...getAuthHeaders(),
      ...customHeaders
    };

    let query_path = "?"
    Object.entries(query_params).forEach(([key, value]) => {
        query_path += `${key}=${value}&`
    })
    query_path = query_path.slice(0, query_path.length - 1)
    const finalUrl = base_url + url + query_path

    const response = await axios({
      method: method,
      url: finalUrl,
      data: data,
      headers: finalHeaders,
    });
    return response.data;
  } catch (error: any) {
    console.error("API Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });

    const errorMessage =
      error.response?.data?.meta?.msg || "An error occurred. Please try again.";
    //show error
    throw error;
  }
};

export default apiService;
