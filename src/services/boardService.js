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
      .filter(x => !ignoreStatuses.includes(x.fields['System.State']))
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
}

const instance = new BoardService();
export default instance;
