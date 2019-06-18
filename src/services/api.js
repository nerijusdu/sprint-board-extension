import axios from 'axios';

const invalidateToken = () => {
  window.localStorage.removeItem('appAuthorized');
  window.localStorage.removeItem('accessToken');
  window.localStorage.removeItem('refreshToken');
  window.localStorage.removeItem('expiresIn');
  document.location.href = '/settings';
};

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
      invalidateToken();
    }

    return res;
  } catch (e) {
    if (e.response && e.response.status === 401 && window.localStorage.getItem('appAuthorized')) {
      invalidateToken();
    }
    console.warn(e);
    return null;
  }
};

export default {
  get: handleRequest(axios.get, false),
  post: handleRequest(axios.post, true),
};
