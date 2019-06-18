import qs from 'querystring';
import api from './api';
import secretConfig from '../config.secret.json';
import dateHelper from '../helpers/dateHelper';

export default class AuthService {
  static callbackUrl = `${secretConfig.url}/callback.html`;

  static get authUrl() {
    const params = {
      client_id: secretConfig.clientId,
      response_type: 'Assertion',
      state: 'none',
      scope: 'vso.code vso.project vso.work',
      redirect_uri: AuthService.callbackUrl,
    };
    return `https://app.vssps.visualstudio.com/oauth2/authorize?${qs.stringify(params)}`;
  }

  constructor(store) {
    this.code = '';
    this.accessToken = '';
    this.refreshToken = '';
    this.expiresIn = dateHelper.now();
    this.onAuthorized = () => store.dispatch('authorizeApp');
  }

  async initData() {
    const callbackData = window.localStorage.getItem('callbackData');
    if (callbackData) {
      window.localStorage.removeItem('callbackData');
      await this.handleCallback(callbackData);
      return;
    }

    const accessToken = window.localStorage.getItem('accessToken');
    if (accessToken) {
      this.accessToken = accessToken;
      this.refreshToken = window.localStorage.getItem('refreshToken');
      this.expiresIn = new Date(window.localStorage.getItem('expiresIn'));

      await this.checkTokenExpiration();
    }
  }

  async checkTokenExpiration() {
    if (dateHelper.isBefore(this.expiresIn, dateHelper.now())) {
      await this.refreshAccessToken();
    }
  }

  get authHeader() {
    return { Authorization: `Bearer ${this.accessToken}` };
  }

  async refreshAccessToken() {
    const result = await api.post({
      url: `${secretConfig.authUrl}/RefreshAccessToken`,
      data: {
        refreshToken: this.refreshToken,
        callbackUrl: AuthService.callbackUrl
      }
    });

    if (!result || !result.data.success) {
      return;
    }

    this.saveTokenResponse(result.data);
  }

  async handleCallback(data) {
    const urlParams = new URLSearchParams(data);
    if (urlParams.has('code')) {
      this.code = urlParams.get('code');
      this.onAuthorized();
    }

    await this.getAccessToken();
  }

  async getAccessToken() {
    const result = await api.post({
      url: `${secretConfig.authUrl}/GetAccessToken`,
      data: {
        code: this.code,
        callbackUrl: AuthService.callbackUrl
      }
    });

    if (!result || !result.data.success) {
      return;
    }

    this.code = '';
    this.saveTokenResponse(result.data);
  }

  saveTokenResponse(result) {
    this.accessToken = result.data.access_token;
    this.refreshToken = result.data.refresh_token;
    this.expiresIn = dateHelper.addSeconds(
      dateHelper.now(),
      parseInt(result.data.expires_in, 10)
    );

    window.localStorage.setItem('accessToken', this.accessToken);
    window.localStorage.setItem('refreshToken', this.refreshToken);
    window.localStorage.setItem('expiresIn', this.expiresIn.toISOString());
  }
}
