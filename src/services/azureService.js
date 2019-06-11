import api from './api';
import secretConfig from '../config.secret.json';

class AzureService {
  constructor(company, project) {
    this.company = company;
    this.project = project;
    this.apiVersion = '5.0';
  }

  async getIterationWorkItems(team, iterationId) {
    const result = await api.get({
      url: `https://dev.azure.com/${this.organization}/${this.project}/${team}/_apis/work/teamsettings/iterations/${iterationId}/workitems`,
      params: {
        'api-version': '5.0-preview.1',
      },
    });

    return result;
  }

  async getCurrentIteration(team) {
    const result = await api.get({
      url: `https://dev.azure.com/${this.company}/${this.project}/${team}/_apis/work/teamsettings/iterations`,
      params: {
        $timeframe: 'current',
        'api-version': this.apiVersion,
      },
    });

    if (!result) {
      return null;
    }

    return result.data.value[0];
  }

  static async authorizeUser() {
    const result = await api.get({
      url: 'https://app.vssps.visualstudio.com/oauth2/authorize',
      params: {
        client_id: '',
        response_type: 'Assertion',
        state: '',
        scope: '',
        redirect_uri: '',
      },
    });

    console.log(result);
  }
}

const instance = new AzureService(secretConfig.company, secretConfig.organization);
export default instance;
