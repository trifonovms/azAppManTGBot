import { TableServiceClient, TableClient, AzureNamedKeyCredential, odata } from "@azure/data-tables";
import { setLogLevel } from "@azure/logger";
import { RestError } from "@azure/core-rest-pipeline";
import { Entity, TUser, TUserPreferences } from "./azure-types";


setLogLevel("info");

const tblUsers = "tgUsers"
const tbUserPreferences = "tgUserPreferences";
const partitionKey = "Users";
const partitionKeyUserPreferences = "UserPreferences";
const rowKeyTemplate = "row";

// const serviceClient = new TableServiceClient(
//   `https://${account}.table.core.windows.net`,
//   credential
// );

const connectionString = process.env["AzureWebJobsStorage"];

const usersTable = TableClient.fromConnectionString(connectionString, tblUsers);
const userPreferencesTable = TableClient.fromConnectionString(connectionString, tbUserPreferences);


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