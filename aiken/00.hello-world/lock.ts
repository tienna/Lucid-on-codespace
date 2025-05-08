import {  Blockfrost, Lucid, Addresses,fromHex,toHex,fromText, Data, Constr } from "https://deno.land/x/lucid@0.20.9/mod.ts";
import "jsr:@std/dotenv/load";
import * as cbor from "https://deno.land/x/cbor@v1.4.1/index.js";
// import { getScript, getTxBuilder, getWalletInfoForTx, wallet } from "./common";
// Lấy các biến từ env
const Bob_mnonic = Deno.env.get("MNEMONIC");
const BLOCKFROST_ID = Deno.env.get("BLOCKFROST_ID");
const BLOCKFROST_NETWORK = Deno.env.get("BLOCKFROST_NETWORK")

const lucid = new Lucid({
    provider: new Blockfrost(
      BLOCKFROST_NETWORK,
      BLOCKFROST_ID,
    ),
  });
lucid.selectWalletFromSeed(Bob_mnonic);
  // const paymentAddress = await lucid.utils.getAddressDetails(lucid.wallet.address());
  
  
  const Address = await lucid.wallet.address();
  console.log(Address);
  const payment_hash =  Addresses.inspect(Address).payment?.hash;
  if (!payment_hash) {
    throw new Error("Failed to extract payment hash from address");
  }

 


const validator = await readValidator();
const datumInline = Data.to(new Constr(0, [payment_hash]));
const contractAddress = lucid.newScript(validator).toAddress();
    console.log("Contract address:", contractAddress);
     const tx = await lucid
      .newTx()
      .payToContract(contractAddress, { Inline: datumInline },{ lovelace: 2900000n })
      .commit();
    const signedTx = await tx.sign().commit();
    const txHash = await signedTx.submit();
    console.log(`2900000 Lovelace locked into the contract at:    Tx ID: ${txHash} `);

// await lucid.awaitTx(txHash);
 
// console.log(Data.from(datum));

 
//===============Đọc mã CBOR của SC  ============================
async function readValidator(): Promise<SpendingValidator> {
  const validator = JSON.parse(await Deno.readTextFile("plutus.json")).validators[0];
      return {
        type: "PlutusV3",
        script: toHex(cbor.encode(fromHex(validator.compiledCode))),
      };
    }
