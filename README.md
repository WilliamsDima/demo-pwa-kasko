# Осмотр авто — демо

Мобильное веб-демо фотоосмотра автомобиля: 8 шагов съёмки через камеру браузера, таймер осмотра, отправка на бэкенд с прогрессом и результатом. Angular 20 (standalone) + NgRx + RxJS. Устанавливается как PWA на домашний экран.

## Разработка

```bash
npm install
npm start
```

Приложение будет на `http://localhost:4200`.

### Тест камеры с реального телефона

`getUserMedia` требует secure context. На `localhost` это работает всегда (например, в эмуляции мобильного экрана в Chrome DevTools на самом компьютере). Чтобы проверить на реальном телефоне по локальной сети:

```bash
npx ng serve --host 0.0.0.0 --ssl
```

и открыть `https://<IP-компьютера>:4200` с телефона (сертификат самоподписанный — браузер попросит подтвердить исключение).

### Тест PWA (установка на экран, офлайн-кэш)

Service worker не активируется в `ng serve`. Нужен прод-билд, поднятый статик-сервером:

```bash
npx ng build
npx http-server dist/demo-inspection/browser
```

## Сборка

```bash
npx ng build --base-href /имя-репозитория/
```

## Деплой на GitHub Pages

1. Создать репозиторий на GitHub и запушить код в ветку `main`.
2. В настройках репозитория: **Settings → Pages → Source → GitHub Actions**.
3. Workflow `.github/workflows/deploy.yml` соберёт и задеплоит приложение при каждом пуше в `main` (base-href подставляется автоматически из имени репозитория).

## Архитектура

- `src/app/core` — модели, сервисы (камера, ориентация, сеть, загрузка), общие для приложения.
- `src/app/inspection/state` — NgRx: actions/reducer/selectors/effects/facade.
- `src/app/inspection/pages` — smart-компоненты (роутятся).
- `src/app/inspection/components` — dumb-компоненты (только `@Input`/`@Output`).

Эндпоинт отправки фото задаётся в `src/environments/environment.ts` (`uploadEndpoint`) — для подключения реального бэкенда достаточно поменять значение и/или провайдер `InspectionUploadService` в `app.config.ts`.
