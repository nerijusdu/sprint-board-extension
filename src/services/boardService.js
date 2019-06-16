import AzureService from './azureService';

const ignoreStatuses = ['Done', 'DevDone'];

export const Status = {
  Todo: 0,
  Development: 1,
  CodeReview: 2,
  Testing: 3
};

export default class BoardService {
  constructor(storeObj) {
    this.azureService = null;

    storeObj.subscribe((mutation, state) => {
      if (mutation.type === 'updateSettings') {
        this.onSettingsUpdated(state.settings);
        storeObj.dispatch('reloadBoardData');
      }
    });
  }

  onSettingsUpdated(settings) {
    this.azureService = new AzureService(
      settings.organization,
      settings.project,
      settings.team
    );

    this.devTitles = settings.devTitles
      .split(',')
      .map(x => x.trim().toLowerCase());
    this.codeReviewTitles = settings.codeReviewTitles
      .split(',')
      .map(x => x.trim().toLowerCase());
  }

  groupWorkItems(items) {
    const group = items
      .filter(x => x.fields['System.WorkItemType'] !== 'Task' && !ignoreStatuses.includes(x.fields['System.State']))
      .map((task) => {
        const newTask = {
          ...task,
          status: Status.Todo
        };

        const development = task.subtasks.find(x => this.devTitles.includes(x.fields['System.Title'].toLowerCase()));
        const codeReview = task.subtasks.find(x => this.codeReviewTitles.includes(x.fields['System.Title'].toLowerCase()));

        if (development) {
          if (development.fields['System.State'].toLowerCase() === 'done') {
            newTask.status = Status.CodeReview;
          } else {
            newTask.status = Status.Development;
          }
        }
        if (codeReview && codeReview.fields['System.State'].toLowerCase() === 'done') {
          newTask.status = Status.Testing;
        }

        return newTask;
      });

    return group;
  }

  async getBoardItems() {
    try {
      const iteration = await this.azureService.getCurrentIteration();
      const itemReferences = await this.azureService.getIterationWorkItems(iteration.id);
      const items = await this.azureService.getWorkItemDetails(itemReferences);
      const groupedItems = this.groupWorkItems(items);

      return {
        todo: groupedItems.filter(x => x.status === Status.Todo),
        dev: groupedItems.filter(x => x.status === Status.Development),
        codeReview: groupedItems.filter(x => x.status === Status.CodeReview),
        testing: groupedItems.filter(x => x.status === Status.Testing)
      };
    } catch (e) {
      // TODO: show error
      return {
        todo: [],
        dev: [],
        codeReview: [],
        testing: []
      };
    }
  }
}
