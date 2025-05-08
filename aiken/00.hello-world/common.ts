import {  Blockfrost, Lucid, Addresses,fromHex,toHex,fromText, Data, Constr } from "https://deno.land/x/lucid@0.20.9/mod.ts";
import "jsr:@std/dotenv/load";
import * as cbor from "https://deno.land/x/cbor@v1.4.1/index.js";
// import { readValidator, wallet } from "./common";

const Bob_mnonic = Deno.env.get("MNEMONIC");
const BLOCKFROST_ID = Deno.env.get("BLOCKFROST_ID");
const BLOCKFROST_NETWORK = Deno.env.get("BLOCKFROST_NETWORK")

const lucid = new Lucid({
    provider: new Blockfrost(
      BLOCKFROST_NETWORK,
      BLOCKFROST_ID,
    ),
  });

export const wallet = lucid.selectWalletFromSeed(Bob_mnonic);



export function readValidator(): Promise<SpendingValidator> {
    const validator = JSON.parse( Deno.readTextFile("plutus.json")).validators[0];
        return {
          type: "PlutusV3",
          script: toHex(cbor.encode(fromHex(validator.compiledCode))),
        };
      }
  