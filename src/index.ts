import { TClient } from "./client.js";
import * as Actions from "#actions";

const client = new TClient();

await Actions.loadCommands(client);
await Actions.loadEvents(client);

void client.login();