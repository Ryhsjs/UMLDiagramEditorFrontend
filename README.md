# UML Diagram Editor — Frontend

Минимальный статический фронт.

## Структура

```
frontend/
  html/           статические файлы, отдаются nginx-ом как есть
    js/api.js     клиент к бэкенду (fetch, JWT, refresh по cookie)
  nginx.conf      конфиг nginx: раздаёт html/ и проксирует /api/ на бэкенд
  Dockerfile      сборка образа nginx:stable-alpine со статикой внутри
```
