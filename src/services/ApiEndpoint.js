import axios from 'axios';

const instance = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

export const get = (url, params) => instance.get(url, { params });
export const post = (url, data) => instance.post(url, data);
export const put = (url, data) => instance.put(url, data);
export const deleteUser = (url) => instance.delete(url);

// Add the changePassword function
export const changePassword = (url, data) => instance.put(url, data);

instance.interceptors.request.use(function (config) {
  // Do something before request is sent
  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});

// Add a response interceptor
instance.interceptors.response.use(function (response) {
  // console.log('intercepted response', response);
  return response;
}, function (error) {
  console.log('intercepted response error', error);
  return Promise.reject(error);
});
