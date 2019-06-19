import axios from 'axios';
import AuthService from './authService';

const handleRequest = (method, hasData) => async (userConfig) => {
  const config = userConfig || {};
  if (!config.headers) {
    config.headers = {};
  }

  try {
    let res;
    if (hasData) {
      res = await method(config.url, config.data, config);
    } else {
      res = await method(config.url, config);
    }

    if (res && res.status === 203 && window.localStorage.getItem('appAuthorized')) {
      AuthService.clearUserSession();
    }

    return res;
  } catch (e) {
    if (e.response && e.response.status === 401 && window.localStorage.getItem('appAuthorized')) {
      AuthService.clearUserSession();
    }
    // eslint-disable-next-line no-console
    console.warn(e);
    return null;
  }
};

export default {
  get: handleRequest(axios.get, false),
  post: handleRequest(axios.post, true),
};
