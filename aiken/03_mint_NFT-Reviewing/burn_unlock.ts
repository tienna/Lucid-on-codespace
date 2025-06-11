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

const validator = await readValidator();

const parameterized_cbor = applyParamsToScript([fromText("BK02_0005")],validator.script);
const parameterized_script = lucid.newScript({
  type: "PlutusV3",
  script: parameterized_cbor,
});

const scriptAddress =parameterized_script.toAddress();
console.log(`Địa chỉ Parameterized script là: ${scriptAddress}`);
const policyId = parameterized_script.toHash();
const unit = policyId + fromText("BK02_0005");
console.log(`Tên của tài sản dạng hex là: ${unit}`);
const utxos_sc = await lucid.utxosAt(scriptAddress);
const utxo = utxos_sc.find(u => u.assets[unit] && u.assets[unit] >= 1n);
if (!utxo) throw new Error("Không tìm thấy UTXO chứa NFT");
console.log(utxo);

const utxos = await lucid.utxosAt(wallet_address);
const utxo1 = utxos.find((u) => Object.keys(u.assets).length === 1 && u.assets?.lovelace > 5000000n)
console.log(utxo1);


// 1 tương ứng với vị trí thứ 2 của của redeemer trong aiken ==Burn
const mintRedeemer = Data.to(new Constr(1, []));
const tx = await lucid
    .newTx()
    // .mint({[unit]: -1n},mintRedeemer)
    .collectFrom([utxos_sc],Data.void())
    .collectFrom([utxo1])
    .attachScript(parameterized_script.script)
    .addSigner(payment_hash)
    .commit();
const signedTx = await tx.sign().commit();
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