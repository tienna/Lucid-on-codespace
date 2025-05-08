import {  Blockfrost, Lucid, Addresses,fromHex,toHex,applyParamsToScript, Data, Constr, } from "https://deno.land/x/lucid@0.20.9/mod.ts";
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
  console.log(`Địa chỉ ví là: ${wallet_address}`);
  const payment_hash =  Addresses.inspect(wallet_address).payment?.hash;
  if (!payment_hash) {
    throw new Error("Failed to extract payment hash from address");
  }

// Hàm chuyển đổi UTF-8 sang hex
function utf8ToHex(str: string): string {
  if (typeof str !== "string" || str === undefined || str === null) {
    throw new Error(`Invalid input for utf8ToHex: expected string, got ${str}`);
  }
  return Array.from(new TextEncoder().encode(str))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

 // Đọc validator từ plutus.json
 async function readValidator(): Promise<SpendingValidator> {
  const validator = JSON.parse(await Deno.readTextFile("plutus.json")).validators[0];
      return {
        type: "PlutusV3",
        script: toHex(cbor.encode(fromHex(validator.compiledCode))),
      };
    }

const DatumSchema = Data.Object({
  a: Data.Integer,
  b: Data.String,
  c: Data.String,
});
type DatumSchemaType = Data.Static<typeof DatumSchema>;


const datum: DatumSchemaType = {
  a: 42n,
  // b: fromHex(utf8ToHex("Hello-ParameterizedSC")),
  b: payment_hash,
  c: utf8ToHex("Hello-ParameterizedSC"),
};
const datumInline = Data.to(datum,DatumSchema);

console.log(datum);
console.log(datumInline);

const validator = await readValidator();
console.log(validator);
const parameterizedScript = applyParamsToScript([datumInline],validator.script,);
  // Tạo địa chỉ script

const scriptAddress = lucid.newScript({
    type: "PlutusV3",
    script: parameterizedScript,
  }).toAddress();

console.log(`Địa chỉ script là: ${scriptAddress}`);
  // Tạo giao dịch
const tx = await lucid
    .newTx()
    .payToContract(scriptAddress, { Inline: datumInline }, { lovelace: 3600000n })
    .commit();

  // Ký và gửi giao dịch
  const signedTx = await tx.sign().commit();
  const txHash = await signedTx.submit();

  console.log(`Locked 3600000n lovelace to script
    Tx ID: ${txHash}
    Datum: ${datum}`);
 

