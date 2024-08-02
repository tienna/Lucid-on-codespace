import { Blockfrost, Lucid,utf8ToHex,Data,Constr} from "https://deno.land/x/lucid@0.8.3/mod.ts";

//Nhập vào API KEY cho mạng Preview
const lucid = await Lucid.new(new Blockfrost( "https://cardano-preview.blockfrost.io/api/v0", "preview4XXXXX",),"Preview",);

// Nhập vào 24 ký tự ví của Bob
const Bob_mnonic = "điền 24 ký tự vào đây";
lucid.selectWalletFromSeed(Bob_mnonic);


//Soạn thảo giao dich
const tx = await lucid.newTx()
  .payToAddressWithData("addr_test1qprfh5jl5zfklakhcmeezksvrx0ylp6haa24pk5mt4tdw2f48nlr7dmpqgg3vf0626q43cfalep9s8knl03wrxnll6dslr7wfj",Data.to(new Constr(0, [utf8ToHex("Hello Alice")])), { lovelace: 5000000n })
  .payToAddressWithData("addr_test1qqew6jaz63u389gwnp8w92qntetzxs6j9222pn4cnej672vazs7a6wnrseqggj4d4ur43yq9e23r4q0m879t7efyhzjq8mvzua",Data.to(new Constr(0, [utf8ToHex("Hello Bob")])), { lovelace: 5000000n })
  .complete();

// Ký giao dịch
const signedTx = await tx.sign().complete();

//Gửi giao dịch
const txHash = await signedTx.submit();

console.log(`Mã giao dịch là: ${txHash}`);


