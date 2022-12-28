import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { Bot, InlineKeyboard, webhookCallback} from "grammy";

//Store bot screaming status
let permit = false;
const TOKEN_BOT = process.env.TOKEN_BOT;
if(!TOKEN_BOT){
    console.log('TOKEN_BOT not defined');
    throw new Error('TOKEN_BOT not defined');
}
console.log('start');
const bot = new Bot(TOKEN_BOT.toString());
console.log('start TOKEN_BOT');
//This function handles the /scream command
bot.command("permit", () => {
    permit = true;
 });

//This function handles /whisper command
bot.command("opt-out", () => {
    permit = false;
 });

//Pre-assign menu text
const firstMenu = "<b>Permit</b>\n\nInitial permit before knowledge test(NOT CDL)";

//Pre-assign button text
const nextButton = "Next";
const backButton = "Back";
const tutorialButton = "Tutorial";

//Build keyboards
const firstMenuMarkup = new InlineKeyboard().text(nextButton, backButton);
 
const secondMenuMarkup = new InlineKeyboard().text(backButton, backButton).text(tutorialButton, "https://core.telegram.org/bots/tutorial");


//This handler sends a menu with the inline buttons we pre-assigned above
bot.command("menu", async (ctx) => {
  await ctx.reply(firstMenu, {
    parse_mode: "HTML",
    reply_markup: firstMenuMarkup,
  });
});

//This handler processes back button on the menu
bot.callbackQuery(backButton, async (ctx) => {
  //Update message content with corresponding menu section
  await ctx.editMessageText(firstMenu, {
    reply_markup: firstMenuMarkup,
    parse_mode: "HTML",
   });
 });

//This function would be added to the dispatcher as a handler for messages coming from the Bot API
bot.on("message", async (ctx) => {

  const tgUser = {
    id: ctx.message.chat.id,
    first_name: ctx.from.first_name,
    last_name: ctx.from.last_name,
    username: ctx.from.username,
  };
  if(ctx.message.text === '/start'){
    // await addTGUser(tgUser);
    return ctx.reply(`Hi, ${tgUser.first_name}!`);
  }

  if (permit && ctx.message.text) {
    await ctx.reply(`Let's start to find permit. What's your zip code`, {
      entities: ctx.message.entities,
    });
  } else {
    //This is equivalent to forwarding, without the sender's name
    await ctx.copyMessage(ctx.message.chat.id);
  }
});
bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
const httpTrigger: AzureFunction = webhookCallback(bot, "azure");

// const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    
//     context.log('HTTP trigger function processed a request.');
//     const name = (req.query.name || (req.body && req.body.name));
//     const responseMessage = name
//         ? "Hello, " + name + ". This HTTP triggered function executed successfully."
//         : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

//     context.res = {
//         // status: 200, /* Defaults to 200 */
//         body: responseMessage
//     };

// };

export default httpTrigger;