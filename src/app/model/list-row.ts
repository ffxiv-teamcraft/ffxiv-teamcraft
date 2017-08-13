export interface ListRow {
    name?: string;
    icon?: string;
    recipeId?: number;
    id: number;
    amount: number;
    done: number;
    requires?: ListRow[];
}
