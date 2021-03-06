import {getHeaders} from "../DataExchange/Fetch"

const axios = require('axios');
const base = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "http://127.0.0.1:3000/"

export const api_get = (endpoint) => {
   return axios({method: "get", headers: getHeaders(), url: base + endpoint, })
}

