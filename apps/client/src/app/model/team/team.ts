import { DataModel } from '../../core/database/storage/data-model';

export class Team extends DataModel {

  name: string;

  leader: string;

  language = 'en';

  members: string[] = [];

  // To test it: https://discordapp.com/api/webhooks/508611709179789313/jUdVJshi-_EOHnawfijbfF4OJRKAalYtw76AycUw0fk5X5BFJWcWCYd1DWG8gKAQNX0X
  webhook?: string;
}
