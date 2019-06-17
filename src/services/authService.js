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
    const accessToken = window.localStorage.getItem('accessToken');
    if (accessToken) {
      this.accessToken = accessToken;
      this.refreshToken = window.localStorage.getItem('refreshToken');
      this.expiresIn = new Date(window.localStorage.getItem('expiresIn'));

      await this.checkTokenExpiration();
      return;
    }

    const callbackData = window.localStorage.getItem('callbackData');
    if (callbackData) {
      window.localStorage.removeItem('callbackData');
      await this.handleCallback(callbackData);
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
      url: 'https://app.vssps.visualstudio.com/oauth2/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: qs.stringify({
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: secretConfig.appSecret,
        grant_type: 'refresh_token',
        assertion: this.refreshToken,
        redirect_uri: AuthService.callbackUrl
      })
    });

    if (!result) {
      return;
    }

    this.saveTokenResponse(result);
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
      url: 'https://app.vssps.visualstudio.com/oauth2/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: qs.stringify({
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: secretConfig.appSecret,
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: this.code,
        redirect_uri: AuthService.callbackUrl
      })
    });

    if (!result) {
      return;
    }

    this.code = '';
    this.saveTokenResponse(result);
  }

  saveTokenResponse(result) {
    this.accessToken = result.data.access_token;
    this.refreshToken = result.data.refresh_token;
    this.expiresIn = dateHelper.addSeconds(
      dateHelper.now(),
      result.data.expires_in
    );

    window.localStorage.setItem('accessToken', this.accessToken);
    window.localStorage.setItem('refreshToken', this.refreshToken);
    window.localStorage.setItem('expiresIn', this.expiresIn.toISOString());
  }
}
