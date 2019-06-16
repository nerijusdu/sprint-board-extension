import qs from 'querystring';
import moment from 'moment';
import api from './api';
import secretConfig from '../config.secret.json';

export default class AzureService {
  static callbackUrl = `${secretConfig.url}/callback.html`;

  constructor(store, organization, project, team) {
    this.organization = organization;
    this.project = project;
    this.team = team;
    this.apiVersion = '5.0';
    this.code = '';
    this.accessToken = '';
    this.refreshToken = '';
    this.expiresIn = moment();
    this.onAuthorized = () => store.dispatch('authorizeApp');

    this.initData();
  }

  initData() {
    const accessToken = window.localStorage.getItem('accessToken');
    if (accessToken) {
      this.accessToken = accessToken;
      this.refreshToken = window.localStorage.getItem('refreshToken');
      this.expiresIn = moment(window.localStorage.getItem('expiresIn'));

      if (this.expiresIn.isBefore(moment())) {
        this.refreshAccessToken();
      }
      return;
    }

    const callbackData = window.localStorage.getItem('callbackData');
    if (callbackData) {
      window.localStorage.removeItem('callbackData');
      this.handleCallback(callbackData);
    }
  }

  static get authUrl() {
    const params = {
      client_id: secretConfig.clientId,
      response_type: 'Assertion',
      state: 'none',
      scope: 'vso.code vso.project vso.work',
      redirect_uri: AzureService.callbackUrl,
    };
    return `https://app.vssps.visualstudio.com/oauth2/authorize?${qs.stringify(params)}`;
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
        redirect_uri: AzureService.callbackUrl
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
        redirect_uri: AzureService.callbackUrl
      })
    });

    if (!result) {
      return;
    }

    this.code = '';
    this.saveTokenResponse(result);
  }

  async getIterationWorkItems(iterationId) {
    const result = await api.get({
      url: `https://dev.azure.com/${this.organization}/${this.project}/${this.team}/_apis/work/teamsettings/iterations/${iterationId}/workitems`,
      params: {
        'api-version': '5.0-preview.1',
      },
      headers: this.authHeader
    });

    if (!result) {
      return [];
    }

    return result.data.workItemRelations;
  }

  async getWorkItemDetails(itemReferences) {
    const pbiIds = itemReferences
      .filter(x => !x.rel)
      .map(x => x.target.id)
      .join();

    const subtaskIds = itemReferences
      .filter(x => !!x.rel)
      .map(x => x.target.id)
      .join();

    const tasksResult = await api.get({
      url: `https://dev.azure.com/${this.organization}/${this.project}/_apis/wit/workitems`,
      params: {
        ids: pbiIds,
        'api-version': this.apiVersion,
      },
      headers: this.authHeader
    });

    if (!tasksResult) {
      return null;
    }

    const subtasksResult = await api.get({
      url: `https://dev.azure.com/${this.organization}/${this.project}/_apis/wit/workitems`,
      params: {
        ids: subtaskIds,
        'api-version': this.apiVersion,
      },
      headers: this.authHeader
    });

    if (!subtasksResult) {
      return null;
    }

    return tasksResult.data.value.map((task) => {
      const subIds = itemReferences
        .filter(x => x.source && x.source.id === task.id)
        .map(x => x.target.id);

      return {
        ...task,
        subtasks: subtasksResult.data.value.filter(x => subIds.includes(x.id))
      };
    });
  }

  async getCurrentIteration() {
    const result = await api.get({
      url: `https://dev.azure.com/${this.organization}/${this.project}/${this.team}/_apis/work/teamsettings/iterations`,
      params: {
        $timeframe: 'current',
        'api-version': this.apiVersion,
      },
      headers: this.authHeader
    });
    console.log(result);

    if (!result) {
      return null;
    }

    return result.data.value[0];
  }

  saveTokenResponse(result) {
    this.accessToken = result.data.access_token;
    this.refreshToken = result.data.refresh_token;
    this.expiresIn = moment().add(result.data.expires_in, 'seconds');

    window.localStorage.setItem('accessToken', this.accessToken);
    window.localStorage.setItem('refreshToken', this.refreshToken);
    window.localStorage.setItem('expiresIn', this.expiresIn.toISOString());
  }
}
