# Осмотр авто — демо

Мобильное веб-демо фотоосмотра автомобиля: 8 шагов съёмки через камеру браузера, таймер осмотра, отправка на бэкенд с прогрессом и результатом. Angular 20 (standalone) + NgRx + RxJS. Устанавливается как PWA на домашний экран.

## Разработка

```bash
npm install
npm start
```

Приложение будет на `http://localhost:4200`.

### Тест камеры и PWA с реального телефона

`getUserMedia` требует secure context, а service worker (без него PWA не ставится на экран) не активируется в обычном dev-режиме `ng serve`. Оба ограничения снимает:

```bash
npm run serve:lan
```

(это `ng serve --configuration production --ssl --host 0.0.0.0` — прод-конфигурация с активным service worker, HTTPS и биндом на все интерфейсы, а не только localhost).

Дальше открыть `https://<IP-компьютера>:4200` с телефона в той же Wi-Fi сети (IP смотреть через `ipconfig`, адаптер Wi-Fi). Сертификат самоподписанный — браузер попросит подтвердить исключение. После этого должна появиться возможность установить приложение на домашний экран (на Android/Chrome — баннер в приложении; на iOS/Safari — через «Поделиться → На экран «Домой»», `beforeinstallprompt` там не поддерживается).

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
