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
const token_name = fromText("BK03_0003");
const fee_value = 10000000n;
// const payment_credential = paymentCredentialOf("addr_test1qqew6jaz63u389gwnp8w92qntetzxs6j9222pn4cnej672vazs7a6wnrseqggj4d4ur43yq9e23r4q0m879t7efyhzjq8mvzua").hash;
// 32ed4ba2d47913950e984ee2a8135e562343522a94a0ceb89e65af29

const payment_credential = Addresses.inspect(
  "addr_test1qqew6jaz63u389gwnp8w92qntetzxs6j9222pn4cnej672vazs7a6wnrseqggj4d4ur43yq9e23r4q0m879t7efyhzjq8mvzua"
).payment?.hash;
console.log(payment_credential);

const validator = await readValidator();
// const parameterized_cbor = applyParamsToScript([token_name,fee_value,payment_credential],validator.script);
// const parameterized_script = lucid.newScript({
//   type: "PlutusV3",
//   script: parameterized_cbor,
// });
const Params = [Data.Bytes(), Data.Integer(), Data.Bytes()];
const parameterized_script = lucid.newScript(
  {
    type: "PlutusV3",
    script: validator.script,
  },
  [token_name, fee_value, payment_credential],
  Params
);

const scriptAddress = parameterized_script.toAddress();
console.log(`Địa chỉ Parameterized script là: ${scriptAddress}`);
const policyId = parameterized_script.toHash();
const unit = policyId + fromText("BK03_0003");

const mintRedeemer = Data.to(new Constr(0, []));
// const mintRedeemer = Data.void()
const tx = await lucid
  .newTx()
  .mint({ [unit]: 1n }, mintRedeemer)
  .payTo(
    "addr_test1qqew6jaz63u389gwnp8w92qntetzxs6j9222pn4cnej672vazs7a6wnrseqggj4d4ur43yq9e23r4q0m879t7efyhzjq8mvzua",
    { lovelace: 10000000n }
  )
  .attachScript(parameterized_script)
  .commit();

const signedTx = await tx.sign().commit();
await Deno.writeTextFile("BK03_0003-signedTx.cbor", signedTx);
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


