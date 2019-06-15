import azureService from './azureService';

const ignoreStatuses = ['Done', 'DevDone'];
const devTitles = ['Development', 'Implementation', 'Fix'].map(x => x.toLowerCase());
const codeReviewTitles = ['Code review', 'Review'].map(x => x.toLowerCase());

export const Status = {
  Todo: 0,
  Development: 1,
  CodeReview: 2,
  Testing: 3
};

class BoardService {
  groupWorkItems(items) {
    const group = items
      .filter(x => x.fields['System.WorkItemType'] !== 'Task' && !ignoreStatuses.includes(x.fields['System.State']))
      .map((task) => {
        const newTask = {
          ...task,
          status: Status.Todo
        };

        const development = task.subtasks.find(x => devTitles.includes(x.fields['System.Title'].toLowerCase()));
        const codeReview = task.subtasks.find(x => codeReviewTitles.includes(x.fields['System.Title'].toLowerCase()));

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
    const iteration = await azureService.getCurrentIteration();
    const itemReferences = await azureService.getIterationWorkItems(iteration.id);
    const items = await azureService.getWorkItemDetails(itemReferences);
    const groupedItems = this.groupWorkItems(items);

    return {
      todo: groupedItems.filter(x => x.status === Status.Todo),
      dev: groupedItems.filter(x => x.status === Status.Development),
      codeReview: groupedItems.filter(x => x.status === Status.CodeReview),
      testing: groupedItems.filter(x => x.status === Status.Testing)
    };
  }
}

const instance = new BoardService();
export default instance;
