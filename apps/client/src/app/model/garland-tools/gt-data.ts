export class GtData {
  partials: any[];

  public getPartial(id: string, type?: string): any | undefined {
    return (this.partials || []).filter(p => type !== undefined ? p.type === type : true).find(p => p.id === id);
  }
}

