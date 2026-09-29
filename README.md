# UML Diagram Editor — Frontend

Минимальный статический фронт.

## Структура

```
frontend/
  html/                       статические файлы, отдаются nginx-ом как есть
    js/api.js                 клиент к бэкенду (fetch, JWT, refresh по cookie)
  templates/default.conf.template   конфиг nginx: раздаёт html/ и проксирует /api/ на бэкенд
  Dockerfile                  сборка образа nginx:stable-alpine со статикой внутри
```

## Адрес бэкенда

`/api/` проксируется на `http://$BACKEND_HOST:$BACKEND_PORT/api/`. По умолчанию
`BACKEND_HOST=api`, `BACKEND_PORT=8000` (имя сервиса из docker-compose). Чтобы
подключить фронт к бэкенду с другим именем/адресом (например, к сервису
`back-service` в Kubernetes), переопределите переменные окружения контейнера —
редактировать конфиг не нужно.

nginx резолвит `BACKEND_HOST` один раз при старте: если на этот момент
такого хоста/сервиса ещё нет, контейнер не поднимется и будет перезапускаться,
пока бэкенд не появится — это ожидаемо и самовосстанавливается.

## Kubernetes

Манифесты — в `k8s/` (Deployment + NodePort Service `front-service:30081`,
по умолчанию смотрит на `back-service:8000` в namespace `app`).

```bash
docker build -t uml-diagram-editor-web:k8s .
./k8s/deploy.sh
```

Бэкенд для работы фронта не обязателен на момент деплоя (см. выше про
самовосстановление), но обычно оба разворачиваются в один namespace `app`.
