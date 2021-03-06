import AzureService from './azureService';

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
    this.error = content => storeObj.dispatch('showError', content);

    storeObj.subscribe(async (mutation, state) => {
      if (mutation.type === 'updateSettings') {
        await this.onSettingsUpdated(storeObj, state.settings);
        storeObj.dispatch('reloadBoardData');
      }
    });
  }

  async onSettingsUpdated(store, settings) {
    this.azureService = new AzureService(
      store,
      settings.organization,
      settings.project,
      settings.team
    );
    await this.azureService.initData();

    this.devTitles = settings.devTitles
      .split(',')
      .map(x => x.trim().toLowerCase());
    this.codeReviewTitles = settings.codeReviewTitles
      .split(',')
      .map(x => x.trim().toLowerCase());
    this.testingTitles = settings.testingTitles
      .split(',')
      .map(x => x.trim().toLowerCase());
    this.doneTitles = settings.doneTitles
      .split(',')
      .map(x => x.trim().toLowerCase());
  }

  groupWorkItems(items) {
    const group = items
      .filter(x => x.fields['System.WorkItemType'] !== 'Task')
      .map((task) => {
        const newTask = {
          ...task,
          status: Status.Todo,
          assignee: task.fields['System.AssignedTo']
            ? task.fields['System.AssignedTo'].displayName
            : 'Unassigned'
        };

        if (this.doneTitles.includes(task.fields['System.State'].toLowerCase())) {
          newTask.status = Status.Done;
          return newTask;
        }

        const development = task.subtasks.find(x => this.devTitles.includes(x.fields['System.Title'].toLowerCase()));
        const codeReview = task.subtasks.find(x => this.codeReviewTitles.includes(x.fields['System.Title'].toLowerCase()));
        const testing = task.subtasks.find(x => this.testingTitles.includes(x.fields['System.Title'].toLowerCase()));

        if (!development && !codeReview && !testing) {
          return newTask;
        }

        if (development) {
          if (development.fields['System.State'].toLowerCase() === 'done') {
            newTask.status = Status.CodeReview;
            if (codeReview && codeReview.fields['System.AssignedTo']) {
              newTask.assignee = codeReview.fields['System.AssignedTo'].displayName;
            }
          } else if (development.fields['System.State'].toLowerCase() === 'in progress') {
            newTask.status = Status.Development;
            if (development && development.fields['System.AssignedTo']) {
              newTask.assignee = development.fields['System.AssignedTo'].displayName;
            }
          }
        }
        if (codeReview && codeReview.fields['System.State'].toLowerCase() === 'done') {
          newTask.status = Status.Testing;
          if (testing && testing.fields['System.AssignedTo']) {
            newTask.assignee = testing.fields['System.AssignedTo'].displayName;
          }
        }
        if (!testing || testing.fields['System.State'].toLowerCase() === 'done') {
          newTask.status = Status.Done;
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
        testing: groupedItems.filter(x => x.status === Status.Testing),
        done: groupedItems.filter(x => x.status === Status.Done)
      };
    } catch (e) {
      this.error('Error while fetching data.');
      // eslint-disable-next-line no-console
      console.warn(e);

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
