import { IBot } from "@interfaces/IBot";
import Client from "@modules/Client";

/** @deprecated use *RompotClient* */
export type ClientType = Client<IBot>;

export declare type RompotClient = Client<IBot>;
