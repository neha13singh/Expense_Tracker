export interface Tag {
    id: string;
    name: string;
    color: string;
}

export interface Expense {
    id: string;
    amount: number;
    date: string;
    description: string | null;
    tag: Tag;
}
