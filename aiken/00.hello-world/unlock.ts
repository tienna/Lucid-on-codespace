import {  Blockfrost, Lucid, Addresses,fromHex,toHex,SpendingValidator,fromText, Data, Constr, } from "https://deno.land/x/lucid@0.20.9/mod.ts";
import * as cbor from "https://deno.land/x/cbor@v1.4.1/index.js";
import "jsr:@std/dotenv/load";

  
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
 
const validator = await readValidator();
const scriptAddress = lucid.newScript(validator).toAddress();
console.log(`Script address: ${scriptAddress}`);
const redeemer = Data.to(new Constr(0, [utf8ToHex("Hello, BK03")]));

const utxos = await lucid.utxosAt(scriptAddress);
const utxo = utxos.find(u => u.assets.lovelace === 2_900_000n);
if (!utxo) throw new Error("No UTXO with 5 ADA found");
 
const Address = await lucid.wallet.address();
console.log(utxo);
const payment_hash =  Addresses.inspect(Address).payment?.hash;
console.log(redeemer);
  // // Tạo giao dịch mở khóa
 const tx = await lucid
    .newTx()
    .collectFrom([utxo], redeemer)
    .attachScript(validator)
    .addSigner(payment_hash)
    .commit();
const signedTx = await tx.sign().commit();
const txHash = await signedTx.submit();

console.log(`Transaction hash: ${txHash}`);
  

async function readValidator(): Promise<SpendingValidator> {
    const validator = JSON.parse(await Deno.readTextFile("plutus.json")).validators[0];
        return {
          type: "PlutusV3",
          script: toHex(cbor.encode(fromHex(validator.compiledCode))),
        };
      }
  
function utf8ToHex(str: string) {
  return Array.from(str).map(c => 
    c.charCodeAt(0) < 128 ? c.charCodeAt(0).toString(16) : 
    encodeURIComponent(c).replace(/\%/g,'').toLowerCase()
  ).join('');
}

