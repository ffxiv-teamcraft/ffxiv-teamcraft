export class ListDetailsFilters {

  public static DEFAULT: ListDetailsFilters = new ListDetailsFilters(false, false);

  constructor(public hideCompleted: boolean, public hideUsed: boolean) {
  }
}
