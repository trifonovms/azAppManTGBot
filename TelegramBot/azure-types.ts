export type TAzureTable = {
    partitionKey:string;
    rowKey:string;
}
export enum TUserPreferencesType {
    permit,
    knowledgeTest,
}
export type TUserPreferences = {
    userId: number;
    zipCode: string;
    milesArea: number;
    type: TUserPreferencesType
}

export type TUser = {
    id: number;
    first_name:  string;
    last_name:  string;
    username:  string;
}


export type Entity<T> = {
    partitionKey?: string;
    rowKey?: string;
}&T;