import { Blockfrost, Lucid } from "https://deno.land/x/lucid/mod.ts";

const lucid = await Lucid.new(new Blockfrost( "https://cardano-preview.blockfrost.io/api/v0", "preview4QbiejGzlyhUgfvyXZNf8lDEIFjCHjP0"",),"Preview",);

//const privateKey = lucid.utils.generatePrivateKey(); // Bech32 encoded private key
//await Deno.writeTextFile('./privateKey', privateKey); //lưu lại file private key ở lần chạy đầu tiên

// const privateKey = await Deno.readTextFile("./privateKey"); //đọc lại file private key ở lần chạy tiếp theo
// lucid.selectWalletFromPrivateKey(privateKey);
// console.log (await lucid.wallet.address())

const Bob_mnonic = "lottery novel civil green oppose whip offer correct mushroom cricket awkward vague shine another tree boss there perfect asset side release song wedding captain";
lucid.selectWalletFromSeed(Bob_mnonic); 
const tx = await lucid.newTx()
  .payToAddress("addr_test1qprfh5jl5zfklakhcmeezksvrx0ylp6haa24pk5mt4tdw2f48nlr7dmpqgg3vf0626q43cfalep9s8knl03wrxnll6dslr7wfj", { lovelace: 5000000n })
  .payToAddress("addr_test1qqew6jaz63u389gwnp8w92qntetzxs6j9222pn4cnej672vazs7a6wnrseqggj4d4ur43yq9e23r4q0m879t7efyhzjq8mvzua", { lovelace: 5000000n })
  .attachMetadata(674, { msg: ["Hello from Lucid. This is metadata 674" ]})
  .complete();

const signedTx = await tx.sign().complete();
const txHash = await signedTx.submit();

console.log(`Mã giao dịch là: ${txHash}`);


