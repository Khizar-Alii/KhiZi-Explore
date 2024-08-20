import axios from "axios";

const API_KEY = "45068891-26043dcb03fc174ed26196f08";
const apiURL = `https://pixabay.com/api/?key=${API_KEY}`;
const formatUrl = (params) => {
  // {q(query) , page , order , category}
  let url = apiURL + "&per_page=20&safesearch=false&editors_choice=false";
  if (!params) return url;
  let paramKeys = Object.keys(params);
  paramKeys.forEach((key) => {
    let value = key === "q" ? encodeURIComponent(params[key]) : params[key];
    url += `&${key}=${value}`;
  });
  return url;
};

export const apiCall = async (params) => {
  try {
    const response = await axios.get(formatUrl(params));
    const { data } = response;
    return { success: true, data };
  } catch (error) {
    console.log("got error : ", error.message);
    return { success: false, message: error.message };
  }
};
