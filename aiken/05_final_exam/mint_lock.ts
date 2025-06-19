import { Blockfrost, Lucid, Addresses, fromHex, toHex, Data, paymentCredentialOf, Constr, fromText, applyParamsToScript } from "https://deno.land/x/lucid@0.20.9/mod.ts";

// import { applyParamsToScript,} from "@lucid-evolution/lucid";
import "jsr:@std/dotenv/load";
import * as cbor from "https://deno.land/x/cbor@v1.4.1/index.js";
// import { getScript, getTxBuilder, getWalletInfoForTx, wallet } from "./common";

// Lấy các biến từ env
const Bob_mnonic = Deno.env.get("MNEMONIC");
const BLOCKFROST_ID = Deno.env.get("BLOCKFROST_ID");
const BLOCKFROST_NETWORK = Deno.env.get("BLOCKFROST_NETWORK");

const lucid = new Lucid({
  provider: new Blockfrost(
    BLOCKFROST_NETWORK,
    BLOCKFROST_ID,
  ),
});
lucid.selectWalletFromSeed(Bob_mnonic);

//====================xử lý param==================
const prefix_token_name = fromText("BK02");


const validator = await readValidator();
const Params = [Data.Bytes()];
const parameterized_script = lucid.newScript(
  {
    type: "PlutusV3",
    script: validator.script,
  },
  [prefix_token_name],
  Params
);

console.log(parameterized_script.script);
const scriptAddress = parameterized_script.toAddress();
console.log(`Địa chỉ Parameterized script là: ${scriptAddress}`);
const policyId = parameterized_script.toHash();
const unit = policyId + fromText("BK02_TIEN");

const mintRedeemer = Data.to(new Constr(0, []));

const tx = await lucid

const signedTx = await tx.sign().commit();
await Deno.writeTextFile("BK02_0003-signedTx.cbor", signedTx);
const txHash = await signedTx.submit();
console.log(`A NFT was mint at tx:    https://preview.cexplorer.io/tx/${txHash} `);

//===============Đọc mã CBOR của SC  ============================
async function readValidator(): Promise<SpendingValidator> {
  const validator = JSON.parse(await Deno.readTextFile("plutus.json")).validators[0];
  return {
    type: "PlutusV3",
    script: toHex(cbor.encode(fromHex(validator.compiledCode))),
  };
}


