import { EventEmitter } from "events";
import { StaticJsonRpcProvider } from "@ethersproject/providers";
import { hexValue } from "@ethersproject/bytes";
import { Logger } from "@ethersproject/logger";

const logger = new Logger("ethers/5.7.0");

type Window = Record<string, any>;
