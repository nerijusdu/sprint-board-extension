# sprint-board-extension
![Screenshot](https://raw.githubusercontent.com/nerijusdu/sprint-board-extension/master/sprint-board-extension.png)

This is a simple sprint board similar to JIRA. It takes all data from Azure DevOps and presents it in a more comfortable view.
The workflow for AzureDevOps:
- Create Tasks for PBIs (names can be configured):
  - Development
  - Code review
  - Testing
- Change created task state (Todo, In progress, done)

The board will show 5 columns with tasks from azure board:
- To Do
- Development
- Code review
- Testing
- Done

## Project setup
```
npm install
```

- Register app in [Azure DevOps](https://app.vsaex.visualstudio.com/app/register)
  - Callback must be `{your app url}/callback.html`
  - Minimum scopes required:
    - Work items (read)
    - Code (read) - currently not used, save for future
    - Project and team (read) - currently not used, save for future
- Setup [backend auth service](https://github.com/nerijusdu/sprint-board-extension-auth)
- Add `src/config.secret.json` with the following structure:
```
{
  "url": "App URL",
  "clientId": "App ID",
  "authUrl": "backend auth service url"
}
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
