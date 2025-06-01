import {  Blockfrost, Lucid, Addresses,fromHex,toHex,Data, Constr,fromText,applyParamsToScript } from "https://deno.land/x/lucid@0.20.9/mod.ts";
// import { applyParamsToScript,} from "@lucid-evolution/lucid";
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
  
const wallet_dress = await lucid.wallet.address();
const payment_hash =  Addresses.inspect(wallet_dress).payment?.hash;
const utxos = await lucid.utxosAt(wallet_dress);

const utxo = utxos[0];

const param = Data.to(new Constr(0, [fromText("BK03_0001"), utxo.txHash, utxo.outputIndex]));
const validator = await readValidator();
const parameterized_cbor = applyParamsToScript(param,validator.script);
const scriptAddress = lucid.newScript({
  type: "PlutusV3",
  script: parameterized_cbor,
}).toAddress();

console.log(`Địa chỉ Parameterized script là: ${scriptAddress}`);



// const policyId = mintingPolicy.toHash();


// const outRef = new Constr(0, [
//     new Constr(0, [outputReference.txHash]),
//     BigInt(outputReference.outputIndex),
//   ]);

// console.log(`Địa chỉ script là: ${scriptAddress}`);

// const datumInline = Data.to(new Constr(0, [payment_hash]));
// const tx = await lucid
//       .newTx()
//       .payToContract(scriptAddress, { Inline: datumInline },{ lovelace: 2900000n })
//       .commit();
// const signedTx = await tx.sign().commit();
// const txHash = await signedTx.submit();
// console.log(`2900000 Lovelace locked into the contract at:    Tx ID: ${txHash} `);


 
//===============Đọc mã CBOR của SC  ============================
async function readValidator(): Promise<SpendingValidator> {
  const validator = JSON.parse(await Deno.readTextFile("plutus.json")).validators[0];
      return {
        type: "PlutusV3",
        script: toHex(cbor.encode(fromHex(validator.compiledCode))),
      };
    }


