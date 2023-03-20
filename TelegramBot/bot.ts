import { Bot, type Context as TContext, session, Context} from "grammy";
import {addTGUser, TUserPreferences, TUserPreferencesType, addUserPreferences} from './azure-table';
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";
import { getState } from './zipcodes';

type MyContext = TContext & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

const askAndGetResponse = async (conversation: MyConversation, ctx: MyContext, question:string): Promise<string> =>{
    await ctx.reply(question);
    const { message } = await conversation.wait();
    return message?.text;
}

const getUserFromContext = (ctx: Context) => {
    return {
        id: ctx.message.chat.id,
        first_name: ctx.from.first_name,
        last_name: ctx.from.last_name,
        username: ctx.from.username,
    };
}

async function permitKTConversation(conversation: MyConversation, ctx: MyContext) {
    let zipCode = await askAndGetResponse(conversation, ctx, "What is your ZIP code?");
    if(getState(zipCode) !== 'NJ'){
        await ctx.reply('You are entered invalid zip code, please enter zip code of NJ!');
        zipCode = await askAndGetResponse(conversation, ctx, "What is your ZIP code?");
    }
    let milesAreaString = await askAndGetResponse(conversation, ctx, "What is your area distance for search in miles?");
    const milesArea = parseInt(milesAreaString, 10);
    
    ctx.reply(`Thank you for update, starting search new appointment in area ${milesArea}mi near ${zipCode} zipcode!`);
    
    const tgUser = getUserFromContext(ctx);
    const userPreference: TUserPreferences = {
        userId: tgUser.id,
        zipCode,
        milesArea,
        type: TUserPreferencesType.permit,
    }
    await addUserPreferences(userPreference);

}

async function knowledgeTestConversation(conversation: MyConversation, ctx: MyContext) {
    let zipCode = await askAndGetResponse(conversation, ctx, "What is your ZIP code?");
    if(getState(zipCode) !== 'NJ'){
        await ctx.reply('You are entered invalid zip code, please enter zip code of NJ!');
        zipCode = await askAndGetResponse(conversation, ctx, "What is your ZIP code?");
    }
    let milesAreaString = await askAndGetResponse(conversation, ctx, "What is your area distance for search in miles?");
    const milesArea = parseInt(milesAreaString, 10);
    
    ctx.reply(`Thank you for update, starting search new appointment in area ${milesArea}mi near ${zipCode} zipcode!`);
    
    const tgUser = getUserFromContext(ctx);
    const userPreference: TUserPreferences = {
        userId: tgUser.id,
        zipCode,
        milesArea,
        type: TUserPreferencesType.knowledgeTest,
    }
    await addUserPreferences(userPreference);

}


async function deleteSubscriptionsConversation(conversation: MyConversation, ctx: MyContext) {
    const promDelete = await askAndGetResponse(conversation, ctx, `Are you sure want delete subscriptions?. You have 0 subscriptions`);
    ctx.reply(`We are removed your subscriptions! Thank you for being our client!`)
}

export const getBot= (TOKEN_BOT:string) : Bot => {
    if(!TOKEN_BOT){ 
        console.log('TOKEN_BOT not defined');
        throw new Error('TOKEN_BOT not defined');
    }
    const bot = new Bot<MyContext>(TOKEN_BOT.toString());
   
    bot.use(session({ initial: () => ({}) }));
    bot.use(conversations());

    bot.use(createConversation(permitKTConversation, 'permitKT'));
    bot.use(createConversation(knowledgeTestConversation, 'knowledgeTest'));
    bot.use(createConversation(deleteSubscriptionsConversation, 'deleteSubscriptions'));
   
    bot.command("permit", async (ctx) => {
        await ctx.conversation.enter("permitKT");
    });

    bot.command("knowledgetest", async (ctx) => {
        await ctx.conversation.enter("knowledgeTest");
    }); 

    bot.command("delete", async (ctx) => {
        await ctx.conversation.enter("deleteSubscriptions");
    });
    
    bot.command("start", async (ctx) => {
        const tgUser = getUserFromContext(ctx);
        if(ctx.message.text === '/start'){
            await addTGUser(tgUser);
            return ctx.reply(`Hi, ${tgUser.first_name}!`);
        }
    });
    
    //This function would be added to the dispatcher as a handler for messages coming from the Bot API
    bot.on("message", async (ctx) => {
        const tgUser = getUserFromContext(ctx);
        if(ctx.message.text === '/start'){
            await addTGUser(tgUser);
            return ctx.reply(`Hi, ${tgUser.first_name}!`);
        }
        

    });
    return bot;
}