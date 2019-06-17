import AuthService from './authService';
import api from './api';

export default class AzureService extends AuthService {
  constructor(store, organization, project, team) {
    super(store, organization, project, team);

    this.organization = organization;
    this.project = project;
    this.team = team;
    this.apiVersion = '5.0';
  }

  getItemLink(id) {
    return `https://${this.organization}.visualstudio.com/${this.project}/_workitems/edit/${id}`;
  }

  async getIterationWorkItems(iterationId) {
    await this.checkTokenExpiration();

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
    await this.checkTokenExpiration();

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
        link: this.getItemLink(task.id),
        subtasks: subtasksResult.data.value.filter(x => subIds.includes(x.id))
      };
    });
  }

  async getCurrentIteration() {
    await this.checkTokenExpiration();

    const result = await api.get({
      url: `https://dev.azure.com/${this.organization}/${this.project}/${this.team}/_apis/work/teamsettings/iterations`,
      params: {
        $timeframe: 'current',
        'api-version': this.apiVersion,
      },
      headers: this.authHeader
    });

    if (!result) {
      return null;
    }

    return result.data.value[0];
  }
}
