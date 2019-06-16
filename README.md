# sprint-board-extension

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
- Add `src/config.secret.json` with the following structure:
```
{
  "url": "App URL",
  "clientId": "App ID",
  "appSecret": "Client Secret"
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
