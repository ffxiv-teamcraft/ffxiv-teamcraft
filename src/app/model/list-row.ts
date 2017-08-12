export interface ListRow {
    name?: string;
    icon?: string;
    id: number;
    amount: number;
    done: number;
    requires?: ListRow[];
}
