import { DataModel } from '../../core/database/storage/data-model';
import { WebhookSetting } from './webhook-setting';
import { WebhookSettingType } from './webhook-setting-type';

export class Team extends DataModel {

  name: string;

  leader: string;

  language = 'en';

  members: string[] = [];

  officers: string[] = [];

  // To test it: https://discordapp.com/api/webhooks/508611709179789313/jUdVJshi-_EOHnawfijbfF4OJRKAalYtw76AycUw0fk5X5BFJWcWCYd1DWG8gKAQNX0X
  webhook?: string;

  webhookSettings: WebhookSetting[] = Object.keys(WebhookSettingType).map(type => {
    return { name: <WebhookSettingType>type, value: true };
  });

  constructor() {
    super();
  }

  isOfficer(member: string): boolean {
    return this.members.indexOf(member) > -1 && this.officers.indexOf(member) > -1;
  }

  hasSettingEnabled(setting: WebhookSettingType): boolean {
    const entry = this.webhookSettings.find(s => s.name === WebhookSettingType[setting]);
    return entry ? entry.value : true;
  }

  afterDeserialized(): void {
    if (!this.webhookSettings.some(setting => setting.name === WebhookSettingType.FINAL_LIST_PROGRESSION)) {
      this.webhookSettings = [
        ...this.webhookSettings,
        {
          name: WebhookSettingType.FINAL_LIST_PROGRESSION,
          value: true
        }
      ];
    }
    if (!this.webhookSettings.some(setting => setting.name === WebhookSettingType.ITEM_PROGRESSION)) {
      this.webhookSettings = [
        ...this.webhookSettings,
        {
          name: WebhookSettingType.ITEM_PROGRESSION,
          value: true
        }
      ];
    }
  }
}
