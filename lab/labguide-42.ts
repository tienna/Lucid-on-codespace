import { Blockfrost, Lucid } from "https://deno.land/x/lucid/mod.ts";

//Nhập vào API KEY cho mạng Preview
const lucid = await Lucid.new(new Blockfrost( "https://cardano-preview.blockfrost.io/api/v0", "preview4XXXXX",),"Preview",);

// Nhập vào 24 ký tự ví của Bob
const Bob_mnonic = "điền 24 ký tự vào đây";
lucid.selectWalletFromSeed(Bob_mnonic);


//Soạn thảo giao dich
const tx = await lucid.newTx()
  .payToAddress("addr_test1qprfh5jl5zfklakhcmeezksvrx0ylp6haa24pk5mt4tdw2f48nlr7dmpqgg3vf0626q43cfalep9s8knl03wrxnll6dslr7wfj", { lovelace: 5000000n })
  .payToAddress("addr_test1qqew6jaz63u389gwnp8w92qntetzxs6j9222pn4cnej672vazs7a6wnrseqggj4d4ur43yq9e23r4q0m879t7efyhzjq8mvzua", { lovelace: 5000000n })
  .attachMetadata(674, { msg: ["Hello from Lucid. This is metadata 674" ]})
  .complete();

//Ký giao dịch
const signedTx = await tx.sign().complete();

//Gửi giao dịch
const txHash = await signedTx.submit();

console.log(`Mã giao dịch là: ${txHash}`);


