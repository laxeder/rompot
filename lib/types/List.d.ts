export interface ListItem {
    description?: string;
    title: string;
    id?: string;
}
export interface List {
    items: Array<ListItem>;
    title: string;
}
