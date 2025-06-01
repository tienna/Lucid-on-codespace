import {  Blockfrost, Lucid, Addresses,fromHex,toHex,applyParamsToScript, Data, Constr,fromText } from "https://deno.land/x/lucid@0.20.9/mod.ts";
import "jsr:@std/dotenv/load";
import * as cbor from "https://deno.land/x/cbor@v1.4.1/index.js";
import blueprint from "./plutus.json" with { type: "json" };

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
  
  
  const wallet_address = await lucid.wallet.address();
  // console.log(`Địa chỉ ví là: ${wallet_address}`);
  const payment_hash =  Addresses.inspect(wallet_address).payment?.hash;
  if (!payment_hash) {
    throw new Error("Failed to extract payment hash from address");
  }


 // Đọc validator từ plutus.json
 async function readValidator(): Promise<SpendingValidator> {
  const validator = JSON.parse(await Deno.readTextFile("plutus.json")).validators[0];
      return {
        type: "PlutusV3",
        script: toHex(cbor.encode(fromHex(validator.compiledCode))),
      };
    }
// ========================= code thay doi tu day==============================

const redeemer = Data.to(new Constr(0, [fromText("Unlock for me")]));
console.log(`Redeemer sẽ được truyền vào SC là: ${redeemer}`);
const validator = await readValidator();
// console.log(validator);

const parameterizedScript = applyParamsToScript([payment_hash],validator.script,);
const script = lucid.newScript({
    type: "PlutusV3",
    script: parameterizedScript,
  });

const scriptAddress=script.toAddress();
console.log(`Địa chỉ script là: ${scriptAddress}`);

const utxos = await lucid.utxosAt(scriptAddress);
const utxo = utxos.find(u => u.txHash===  "d1804d0218957b5bdd34ccccabd2b693210b0620c4bffc17b4f57474a88f33ee");
console.log(utxo);

const tx = await lucid
  .newTx()
  .collectFrom([utxo], redeemer)
  .addSigner(payment_hash)
  .attachScript(script)  //validator})
  .commit();
  const signedTx = await tx.sign().commit();
  const tx_hash = await signedTx.submit();
console.log(`Transaction hash: ${tx_hash}`);