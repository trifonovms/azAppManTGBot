import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { Bot, webhookCallback} from "grammy";
import { getBot } from "./bot";
import * as express from "express";


const TOKEN_BOT = process.env.TOKEN_BOT;
let httpTrigger: AzureFunction;
const bot:Bot = getBot(TOKEN_BOT);
bot.start();

if(process.env.APP_TYPE==='AZURE'){
    httpTrigger = webhookCallback(bot, "azure");
}else{
    const app = express(); // or whatever you're using
    app.use(express.json()); // parse the JSON request body
    
    // "express" is also used as default if no argument is given.
    app.use('/tgbot',webhookCallback(bot, "express"));
    const port = 3000;
    app.listen(port, () => {
        console.log(`app listening on port ${port}`)
    });
}

export default httpTrigger;
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