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
      .map(x => x.target.id);

    const subtaskIds = itemReferences
      .filter(x => !!x.rel)
      .map(x => x.target.id);

    const tasksResult = await this.batchGetWorkItemDetails(pbiIds);

    const subtasksResult = await this.batchGetWorkItemDetails(subtaskIds);

    return tasksResult.map((task) => {
      const subIds = itemReferences
        .filter(x => x.source && x.source.id === task.id)
        .map(x => x.target.id);

      return {
        ...task,
        link: this.getItemLink(task.id),
        subtasks: subtasksResult.filter(x => subIds.includes(x.id))
      };
    });
  }

  async batchGetWorkItemDetails(ids) {
    const size = 200;
    const batches = [];
    if (ids.length > size) {
      const count = Math.ceil(ids.length / size);
      for (let i = 0; i < count; i += 1) {
        batches[i] = ids.slice(i * size, (i + 1) * size);
      }
    } else {
      batches[0] = ids;
    }

    let result = [];
    const promises = batches.map(async (b) => {
      const batchResult = await api.get({
        url: `https://dev.azure.com/${this.organization}/${this.project}/_apis/wit/workitems`,
        params: {
          ids: b.join(),
          'api-version': this.apiVersion,
        },
        headers: this.authHeader
      });

      if (batchResult) {
        result = result.concat(batchResult.data.value);
      }
    });

    await Promise.all(promises);
    return result;
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
