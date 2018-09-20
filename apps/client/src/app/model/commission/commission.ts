import { List } from '../../modules/list/model/list';
import { CommissionStatus } from './commission-status';
import { CommissionDiscussion } from './commission-discussion';
import { DataModel } from '../../core/database/storage/data-model';
import { DeserializeAs } from '@kaiu/serializer';
import { ListRow } from '../../modules/list/model/list-row';

export class Commission extends DataModel {

  /**
   * The name of the list used for the commission
   */
  name: string;

  /**
   * The id of the list linked to the commission
   */
  listId: string;

  ratedBy: { [index: string]: boolean } = {};

  items: ListRow[] = [];

  /**
   * The price that the buyer is willing to pay, defaults to 0 if he wants to negotiate the price or doesn't know which one to set.
   * @type {number}
   */
  price = 0;

  /**
   * Determines if the list has all the mats for crafts, and a crafter only can fill the commission, as he just has to craft things.
   */
  onlyNeedsCraft: boolean;

  /**
   * The id of the request's author.
   */
  authorId: string;

  /**
   * The name of the server for the request.
   */
  server: string;

  /**
   * The discussions of the request, one per crafter.
   */
  @DeserializeAs([CommissionDiscussion])
  discussions: CommissionDiscussion[] = [];

  /**
   * The ids of all the crafters who said "I want to do that"
   */
  candidateIds: string[] = [];

  /**
   * The date of the commissio creation.
   * @type {string}
   */
  createdAt: string = new Date().toISOString();

  /**
   * The status of the request.
   */
  status: CommissionStatus = CommissionStatus.CREATED;

  /**
   * The id of the crafter who's crafting the request, can be undefined if status is CREATED.
   */
  crafterId?: string;

  /**
   * The history of payments done.
   * @type {any[]}
   */
  payments: { date: string, amount: number }[] = [];
  /**
   * Array to store new things on the list, identified by string to have a nice way to find where to put badges.
   */
  public newThings: string[] = [];

  constructor(authorId?: string, list?: List, server?: string) {
    super();
    // Only use constructor logic if we're creating a new commission, else it means we're deserializing the object, meaning that
    // everything we need is already in the object itself.
    if (list !== undefined) {
      this.items = list.finalItems;
      this.listId = list.$key;
      this.server = server;
      this.authorId = authorId;
      this.name = list.name;
    }
  }

  /**
   * Gets the total paid for this commission so far.
   * @returns {number}
   */
  public get totalPaid(): number {
    return this.payments.reduce((total, payment) => total + payment.amount, 0);
  }

  /**
   * Boolean to show if there's something new to see.
   * @type {boolean}
   */
  get hasNewThings(): boolean {
    return this.newThings.length > 0;
  }

  public addNewThing(description: string): void {
    this.newThings.push(description);
  }

  public removeNewThing(matcher: string): void {
    this.newThings = this.newThings.filter(thing => thing.indexOf(matcher) === -1);
  }

  public hasNewThing(matcher: string): boolean {
    return this.newThings.find(thing => thing.indexOf(matcher) > -1) !== undefined;
  }

  public isGathering(): boolean {
    return this.items.find(item => item.gatheredBy !== undefined) !== undefined;
  }

  public isCrafting(): boolean {
    return this.items.find(item => item.craftedBy !== undefined && item.craftedBy.length > 0) !== undefined;
  }

  public isHunting(): boolean {
    return this.items.find(item => item.drops !== undefined && item.drops.length > 0) !== undefined;
  }

  public isCompleted(): boolean {
    return this.items.reduce((completed, item) => item.done >= item.amount && completed, true);
  }

  public isDone(): boolean {
    return this.isCompleted() && this.totalPaid >= this.price;
  }

  /**
   * Gets commission craft progress from 0 to 100.
   * @returns {number}
   */
  public getProgress(): number {
    const done = this.items.filter(item => item.done >= item.amount).length;
    return 100 * done / this.items.length;
  }
}
