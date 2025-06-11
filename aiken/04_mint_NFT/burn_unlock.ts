import {  Blockfrost, Lucid, Addresses,fromHex,toHex,applyParamsToScript, Data, Constr,fromText, } from "https://deno.land/x/lucid@0.20.9/mod.ts";
import "jsr:@std/dotenv/load";
import * as cbor from "https://deno.land/x/cbor@v1.4.1/index.js";


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
  
const wallet_address = await lucid.wallet.address();
console.log(`Địa chỉ ví là: ${wallet_address}`);
const payment_hash =  Addresses.inspect(wallet_address).payment?.hash;


const token_name = fromText("BK02_0005");
const fee_value = 10000000n;
const payment_credential =  Addresses.inspect("addr_test1qqew6jaz63u389gwnp8w92qntetzxs6j9222pn4cnej672vazs7a6wnrseqggj4d4ur43yq9e23r4q0m879t7efyhzjq8mvzua").payment?.hash;
console.log(payment_credential);

const validator = await readValidator();
const Params  = [Data.Bytes(), Data.Integer(), Data.Bytes()];
const parameterized_script = lucid.newScript({
  type: "PlutusV3",
  script: validator.script,
},[token_name,fee_value,payment_credential]
,Params
);

const scriptAddress =parameterized_script.toAddress();
console.log(`Địa chỉ Parameterized script là: ${scriptAddress}`);
const policyId = parameterized_script.toHash();
const unit = policyId + fromText("BK02_0005");
const utxos = await lucid.utxosAt(wallet_address);
// const utxo1 = utxos.find(u => u.txHash === "fc83d672482b12298feae43a5ef90a63551f5df96acdbf54a21c0c1f883d8eba" && u.outputIndex === 1);

const utxo = utxos.find(u => u.assets[unit] && u.assets[unit] >= 1n);
if (!utxo) throw new Error("Không tìm thấy UTXO chứa NFT");

console.log(utxo);
// 1 tương ứng với vị trí thứ 2 của của redeemer trong aiken ==Burn
const mintRedeemer = Data.to(new Constr(1, []));
const tx = await lucid
    .newTx()
    .mint({[unit]: -1n},mintRedeemer)
    .collectFrom([utxo])
    .payTo("addr_test1qqew6jaz63u389gwnp8w92qntetzxs6j9222pn4cnej672vazs7a6wnrseqggj4d4ur43yq9e23r4q0m879t7efyhzjq8mvzua", { lovelace: 10000000n })
    // .collectFrom([utxo1])
    .attachScript(parameterized_script)
    // .addSigner(payment_hash)
    .commit();
const signedTx = await tx.sign().commit();
await Deno.writeTextFile("Burntx-signedTx.cbor", signedTx);
const txHash = await signedTx.submit();
console.log(`A NFT was Burnt at tx:    https://preview.cexplorer.io/tx/${txHash} `);


 // Đọc validator từ plutus.json
 async function readValidator(): Promise<SpendingValidator> {
  const validator = JSON.parse(await Deno.readTextFile("plutus.json")).validators[0];
      return {
        type: "PlutusV3",
        script: toHex(cbor.encode(fromHex(validator.compiledCode))),
      };
    }