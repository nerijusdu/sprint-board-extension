import qs from 'querystring';
import moment from 'moment';
import api from './api';
import secretConfig from '../config.secret.json';

export class AzureService {
  static callbackUrl = `${secretConfig.url}/callback.html`;

  constructor(company, project) {
    this.company = company;
    this.project = project;
    this.apiVersion = '5.0';
    this.code = '';
    this.accessToken = '';
    this.refreshToken = '';
    this.expiresIn = moment();

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

  get authUrl() {
    const params = {
      client_id: secretConfig.clientId,
      response_type: 'Assertion',
      state: 'none',
      scope: 'vso.code vso.project vso.work',
      redirect_uri: AzureService.callbackUrl,
    };
    return `https://app.vssps.visualstudio.com/oauth2/authorize?${qs.stringify(params)}`;
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
      }),
      noAuth: true
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
      window.localStorage.setItem('code', this.code);
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
      }),
      noAuth: true
    });

    if (!result) {
      return;
    }

    this.code = '';
    this.saveTokenResponse(result);
  }

  async getIterationWorkItems(team, iterationId) {
    const result = await api.get({
      url: `https://dev.azure.com/${this.company}/${this.project}/${team}/_apis/work/teamsettings/iterations/${iterationId}/workitems`,
      params: {
        'api-version': '5.0-preview.1',
      },
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      },
      noAuth: true
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
      url: `https://dev.azure.com/${this.company}/${this.project}/_apis/wit/workitems`,
      params: {
        ids: pbiIds,
        'api-version': this.apiVersion,
      }
    });

    if (!tasksResult) {
      return null;
    }

    const subtasksResult = await api.get({
      url: `https://dev.azure.com/${this.company}/${this.project}/_apis/wit/workitems`,
      params: {
        ids: subtaskIds,
        'api-version': this.apiVersion,
      }
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

  async getCurrentIteration(team) {
    const result = await api.get({
      url: `https://dev.azure.com/${this.company}/${this.project}/${team}/_apis/work/teamsettings/iterations`,
      params: {
        $timeframe: 'current',
        'api-version': this.apiVersion,
      }
    });

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

const instance = new AzureService(secretConfig.company, secretConfig.project);
export default instance;
