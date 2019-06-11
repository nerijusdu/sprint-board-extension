import axios from 'axios';
import secretConfig from '../config.secret.json';

const handleRequest = method => async (userConfig) => {
  const config = userConfig || {};
  if (!config.headers) {
    config.headers = {};
  }

  const token = btoa(`${secretConfig.azureUsername}:${secretConfig.azureToken}`);
  config.headers.Authorization = `Basic ${token}`;

  try {
    return method(config.url, config);
  } catch (e) {
    console.warn(e);
    return null;
  }
};

export default {
  get: handleRequest(axios.get),
  post: handleRequest(axios.post),
};
