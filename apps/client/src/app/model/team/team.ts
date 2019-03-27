import { DataModel } from '../../core/database/storage/data-model';
import { WebhookSetting } from './webhook-setting';
import { WebhookSettingType } from './webhook-setting-type';

export class Team extends DataModel {

  name: string;

  leader: string;

  language = 'en';

  members: string[] = [];

  officiers: string[] = [];

  // To test it: https://discordapp.com/api/webhooks/508611709179789313/jUdVJshi-_EOHnawfijbfF4OJRKAalYtw76AycUw0fk5X5BFJWcWCYd1DWG8gKAQNX0X
  webhook?: string;

  webhookSettings: WebhookSetting[] = Object.keys(WebhookSettingType).map(type => {
    return { name: <WebhookSettingType>type, value: true };
  });

  isOfficier(member: string): boolean {
    return this.members.indexOf(member) > -1 && this.officiers.indexOf(member) > -1;
  }

  hasSettingEnabled(setting: WebhookSettingType): boolean {
    return this.webhookSettings.find(s => s.name === WebhookSettingType[setting]).value;
  }
}
