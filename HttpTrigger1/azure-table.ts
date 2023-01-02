import { TableServiceClient, TableClient, AzureNamedKeyCredential, odata } from "@azure/data-tables";
import { setLogLevel } from "@azure/logger";
import { RestError } from "@azure/core-rest-pipeline";


setLogLevel("info");

const account = "appointmentcrawlergac19";
const accountKey = "qQb064LwcqGVudB7W2nWT0VgufiRo/IwaPKhsVrEpnbWD7et/EoQYohGNUgKh1Zu16/muV5f8aki+ASt9OEWnQ==";
const tblUsers = "tgUsers"
const tbUserPreferences = "tgUserPreferences";
const partitionKey = "Users";
const partitionKeyUserPreferences = "UserPreferences";
const rowKeyTemplate = "row";

const credential = new AzureNamedKeyCredential(account, accountKey);

// const serviceClient = new TableServiceClient(
//   `https://${account}.table.core.windows.net`,
//   credential
// );
type TAzureTable = {
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


type Entity<T> = {
    partitionKey?: string;
    rowKey?: string;
}&T;

const usersTable = new TableClient(`https://${account}.table.core.windows.net`, tblUsers, credential);
const userPreferencesTable = new TableClient(`https://${account}.table.core.windows.net`, tbUserPreferences, credential);

export const getUser =async (entityUser:Entity<TUser>) => {
    try {
        const user = await usersTable.getEntity(entityUser.partitionKey, entityUser.rowKey);
        return user;    
    } catch (error) {
        if((error as RestError).statusCode === 404){
            return undefined;
        }
        throw error;
    }
    
}

export const getEntity = <T>(partitionKey:string, rowKey:string, obj: T): Entity<T> => {
    return {
        partitionKey,
        rowKey,
        ...obj,
    }
}

export const addTGUser = async (tgUser:TUser) => {
    try {
        const entity:Entity<TUser> = getEntity<TUser>(partitionKey, `row${tgUser.id}`, tgUser);

        const user = await getUser(entity);
        if(!user){
            await usersTable.createEntity(entity as any);
        }else{
            console.log("User already exists");
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
    
}

const getInternalUserPreferences =async (entity:Entity<TUserPreferences>) => {
    try {
        const user = await userPreferencesTable.getEntity(entity.partitionKey, entity.rowKey);
        return user;    
    } catch (error) {
        if((error as RestError).statusCode === 404){
            return undefined;
        }
        throw error;
    }
    
}

export const getUserPreferences = async (tgUserPreferences:TUserPreferences) => {
    const entity:Entity<TUserPreferences> = getEntity<TUserPreferences>(partitionKeyUserPreferences, 
        `${rowKeyTemplate}${tgUserPreferences.userId}_${tgUserPreferences.type}`, 
        tgUserPreferences
    );
    return getInternalUserPreferences(entity);
}

export const addUserPreferences =async (tgUserPreferences:TUserPreferences) => {
    try {
        const entity:Entity<TUserPreferences> = getEntity<TUserPreferences>(partitionKeyUserPreferences, 
            `${rowKeyTemplate}${tgUserPreferences.userId}_${tgUserPreferences.type}`, 
            tgUserPreferences
        );
        const user = await getInternalUserPreferences(entity);
        if(!user){
            await userPreferencesTable.createEntity(entity as any);
        }else{
           await userPreferencesTable.updateEntity(entity as any, "Replace");
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}