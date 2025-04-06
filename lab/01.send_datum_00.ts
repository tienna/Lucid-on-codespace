
// import { utf8ToHex } from "https://deno.land/x/lucid@0.8.3/mod.ts";
import { Blockfrost,Lucid,Data,Constr } from "https://deno.land/x/lucid@0.20.9/mod.ts";
import "jsr:@std/dotenv/load";

function utf8ToHex(str: string): string {
    return Array.from(str)
      .map((c: string) => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
  }

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


//Soạn thảo giao dich
const tx = await lucid.newTx()
.payToWithData("addr_test1qprfh5jl5zfklakhcmeezksvrx0ylp6haa24pk5mt4tdw2f48nlr7dmpqgg3vf0626q43cfalep9s8knl03wrxnll6dslr7wfj",Data.to(new Constr(0, [utf8ToHex("Hello Alice")])), { lovelace: 5000000n })
.payToWithData("addr_test1qqew6jaz63u389gwnp8w92qntetzxs6j9222pn4cnej672vazs7a6wnrseqggj4d4ur43yq9e23r4q0m879t7efyhzjq8mvzua",Data.to(new Constr(0, [utf8ToHex("Hello Bob")])), { lovelace: 5000000n })
.commit();

//Ký giao dịch
 const signedTx = await tx.sign().commit();

//Gửi giao dịch
const txHash = await signedTx.submit();
console.log(`Bạn có thể kiểm tra giao dịch tại: https://preview.cexplorer.io/tx/${txHash}`);


