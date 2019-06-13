import axios from 'axios';
import secretConfig from '../config.secret.json';

const handleRequest = (method, hasData) => async (userConfig) => {
  const config = userConfig || {};
  if (!config.headers) {
    config.headers = {};
  }

  if (!config.noAuth) {
    const token = btoa(`${secretConfig.azureUsername}:${secretConfig.azureToken}`);
    config.headers.Authorization = `Basic ${token}`;
  }

  try {
    let res;
    if (hasData) {
      res = await method(config.url, config.data, config);
    } else {
      res = await method(config.url, config);
    }

    return res;
  } catch (e) {
    console.warn(e);
    return null;
  }
};

export default {
  get: handleRequest(axios.get, false),
  post: handleRequest(axios.post, true),
};
