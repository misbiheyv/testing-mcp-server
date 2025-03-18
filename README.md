# mcp-testing-server

### Сборка:
```sh
npm run build
```

### Конфиг для Cline (есть только для VSCode, я бы рекомендовал использовать его):

```json
{
  "mcpServers": {
    "tms-adapter": {
      // Путь до исполняемого файла, запустится только на 23 ноде
      "command": "/Users/$USER/.nvm/versions/node/v23.7.0/bin/node",
      "args": [
        // Путь до сбилженного mcp сервера
        "/Users/$USER/mcp-testing-tool/build/index.js"
      ],
      "disabled": false,
      "env": {
        // Токен для TMS
        "TMS_TOKEN": ""
      }
    }
  }
}
```

### Конфиг для Continue (есть и для VSCode и для WS):

```json
{
  // ...
  "experimental": {
    "modelContextProtocolServers": [
      {
        "transport": {
          "type": "stdio",
          // Путь до исполняемого файла, запустится только на 23 ноде
          "command": "/Users/$USER/.nvm/versions/node/v23.7.0/bin/node",
          "args": [
            // Путь до сбилженного mcp сервера
            "/Users/$USER/mcp-testing-tool/build/index.js"
          ]
        }
      }
    ]
  },
  // ...
}
```
