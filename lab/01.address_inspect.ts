import { Blockfrost,Lucid,Data,Constr } from "https://deno.land/x/lucid@0.20.9/mod.ts";
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
// const paymentAddress = await lucid.utils.getAddressDetails(lucid.wallet.address());


const paymentAddress = lucid.utils.getAddressDetails(await lucid.wallet.address())
console.log(paymentAddress);

const rewardAddress = await lucid.wallet.rewardAddress();

console.log(rewardAddress);

// const address = "addr_test1qzjzr7f3yj3k4jky7schc55qjclaw6fhc3zfnrarma9l3579hwurrx9w7uhz99zdc3fmmzwel6hac404zyywjl5jhnls09rtm6";
// const  {payment, delegation}  = Addresses.inspect(address);
//  // const payment_object = JSON.stringify(payment)
// // console.log(`Payment Credential: ${payment_object}`);
// console.log(payment);
// console.log(delegation);