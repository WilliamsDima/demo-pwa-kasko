import { StepConfig } from './models/inspection-step.model';

export const INSPECTION_STEPS: readonly StepConfig[] = [
  {
    id: 'vin',
    order: 1,
    title: 'Фото VIN',
    category: 'vin',
    requiredOrientation: 'portrait',
    guideAspectRatio: 3 / 4,
    hint: {
      title: 'Где найти VIN',
      description:
        'Нужно фото VIN на кузове автомобиля или под лобовым стеклом. Таблички и наклейки не подойдут',
    },
  },
  {
    id: 'windshield',
    order: 2,
    title: 'Лобовое стекло',
    category: 'windshield',
    requiredOrientation: 'portrait',
    guideAspectRatio: 3 / 4,
    hint: {
      title: 'Как сфотографировать лобовое стекло',
      description: 'Сфотографируйте лобовое стекло целиком, стоя перед автомобилем',
    },
  },
  {
    id: 'windshieldLogo',
    order: 3,
    title: 'Логотип на лобовом стекле',
    category: 'windshield',
    requiredOrientation: 'portrait',
    guideAspectRatio: 3 / 4,
    hint: {
      title: 'Логотип на лобовом стекле',
      description: 'Сделайте чёткое фото логотипа или наклейки производителя на лобовом стекле',
    },
  },
  {
    id: 'frontLeft',
    order: 4,
    title: 'Авто спереди слева',
    category: 'exterior',
    requiredOrientation: 'landscape',
    guideAspectRatio: 4 / 3,
    hint: {
      title: 'Как сделать нужный ракурс',
      description: 'Автомобиль должен полностью попасть в кадр, включая передний бампер и госномер',
    },
  },
  {
    id: 'frontRight',
    order: 5,
    title: 'Авто спереди справа',
    category: 'exterior',
    requiredOrientation: 'landscape',
    guideAspectRatio: 4 / 3,
    hint: {
      title: 'Как сделать нужный ракурс',
      description: 'Автомобиль должен полностью попасть в кадр, включая передний бампер и госномер',
    },
  },
  {
    id: 'backRight',
    order: 6,
    title: 'Авто сзади справа',
    category: 'exterior',
    requiredOrientation: 'landscape',
    guideAspectRatio: 4 / 3,
    hint: {
      title: 'Как сделать нужный ракурс',
      description: 'Автомобиль должен полностью попасть в кадр, включая задний бампер и госномер',
    },
  },
  {
    id: 'backLeft',
    order: 7,
    title: 'Авто сзади слева',
    category: 'exterior',
    requiredOrientation: 'landscape',
    guideAspectRatio: 4 / 3,
    hint: {
      title: 'Как сделать нужный ракурс',
      description: 'Автомобиль должен полностью попасть в кадр, включая задний бампер и госномер',
    },
  },
  {
    id: 'odometer',
    order: 8,
    title: 'Пробег авто',
    category: 'odometer',
    requiredOrientation: 'portrait',
    guideAspectRatio: 3 / 4,
    hint: {
      title: 'Пробег автомобиля',
      description: 'Сфотографируйте приборную панель так, чтобы значение пробега было чётко видно',
    },
  },
] as const;

export const INSPECTION_TIMER_SECONDS = 15 * 60;

export const STEP_CATEGORY_LABELS: Readonly<Record<StepConfig['category'], string>> = {
  vin: 'VIN',
  exterior: 'Автомобиль',
  windshield: 'Лобовое стекло',
  odometer: 'Пробег авто',
};
