import AzureService from './azureService';
import mockData from '../mockData.json';

export const Status = {
  Todo: 0,
  Development: 1,
  CodeReview: 2,
  Testing: 3,
  Done: 4
};

export default class BoardService {
  constructor(storeObj) {
    this.azureService = null;

    storeObj.subscribe((mutation, state) => {
      if (mutation.type === 'updateSettings') {
        this.onSettingsUpdated(storeObj, state.settings);
        storeObj.dispatch('reloadBoardData');
      }
    });
  }

  onSettingsUpdated(store, settings) {
    this.azureService = new AzureService(
      store,
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
    this.testingTitles = settings.testingTitles
      .split(',')
      .map(x => x.trim().toLowerCase());
  }

  groupWorkItems(items) {
    const group = items
      .filter(x => x.fields['System.WorkItemType'] !== 'Task')
      .map((task) => {
        const newTask = {
          ...task,
          status: Status.Todo
        };

        const development = task.subtasks.find(x => this.devTitles.includes(x.fields['System.Title'].toLowerCase()));
        const codeReview = task.subtasks.find(x => this.codeReviewTitles.includes(x.fields['System.Title'].toLowerCase()));
        const testing = task.subtasks.find(x => this.testingTitles.includes(x.fields['System.Title'].toLowerCase()));

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
        if (testing && testing.fields['System.State'].toLowerCase() === 'done') {
          newTask.status = Status.Done;
        }

        return newTask;
      });

    return group;
  }

  async getBoardItems() {
    console.log('updating items');
    try {
      // const iteration = await this.azureService.getCurrentIteration();
      // const itemReferences = await this.azureService.getIterationWorkItems(iteration.id);
      // const items = await this.azureService.getWorkItemDetails(itemReferences);
      // const groupedItems = this.groupWorkItems(items);

      const groupedItems = mockData;
      return {
        todo: groupedItems.filter(x => x.status === Status.Todo),
        dev: groupedItems.filter(x => x.status === Status.Development),
        codeReview: groupedItems.filter(x => x.status === Status.CodeReview),
        testing: groupedItems.filter(x => x.status === Status.Testing),
        done: groupedItems.filter(x => x.status === Status.Done)
      };
    } catch (e) {
      // TODO: show error
      return {
        todo: [],
        dev: [],
        codeReview: [],
        testing: [],
        done: []
      };
    }
  }
}
