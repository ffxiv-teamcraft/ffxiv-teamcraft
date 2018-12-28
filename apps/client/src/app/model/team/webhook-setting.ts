import { WebhookSettingType } from './webhook-setting-type';

export interface WebhookSetting {
  name: WebhookSettingType;

  value: boolean;
}
