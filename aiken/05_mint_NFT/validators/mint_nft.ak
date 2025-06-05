use aiken/collection/dict
use aiken/collection/list
// use aiken/crypto.{ VerificationKeyHash }
use cardano/address.{ Address, Script }
use cardano/assets.{ PolicyId, lovelace_of }
use cardano/transaction.{ Input, Output, OutputReference, Transaction } as tx

pub type Action {
  Mint
  Burn
}

validator gift_card(
  token_name: ByteArray,
  platform_fee: Int,
  platform_payment_credential: ByteArray,
) {
  spend(_d, _r, own_ref: OutputReference, transaction: Transaction) {
    let Transaction { mint, inputs, .. } = transaction
    // let output_utxo_platform =
    //   find_output(outputs, platform_fee, platform_payment_credential)
    // hàm expect với mint sẽ trả lại asset_name và amount  theo  policy_id từ giao dịch tương tác với Smart contract
    expect Some(own_input) =
      list.find(inputs, fn(input) { input.output_reference == own_ref })
    // input.output.address là địa chỉ của  
    expect Script(policy_id) = own_input.output.address.payment_credential
    expect [Pair(asset_name, amount)] =
      mint
        |> assets.tokens(policy_id)
        |> dict.to_pairs()

    amount == -1 && asset_name == token_name
  }

  // redeemer, policy_id, transaction đều được lấy từ transaction thực
  mint(rdmr: Action, policy_id: PolicyId, transaction: Transaction) {
    let Transaction { mint, outputs, .. } = transaction
    let output_utxo_platform =
      find_output(outputs, platform_fee, platform_payment_credential)
    expect [Pair(asset_name, amount)] =
      mint
        |> assets.tokens(policy_id)
        |> dict.to_pairs()

    when rdmr is {
      Mint -> amount == 1 && asset_name == token_name && output_utxo_platform
      // Unlock asset
      Burn -> amount == -1 && asset_name == token_name && output_utxo_platform
    }
  }

  else(_) {
    fail
  }
}

fn find_output(outputs: List<Output>, fee: Int, addr_cred: ByteArray) {
  list.any(
    outputs,
    fn(output) {
      // lovelace_of(output.value) >= fee && output.address.payment_credential == addr_cred
      // lovelace_of(output.value) >= fee && output.address.payment_credential == address.from_verification_key(
      //   #"32ed4ba2d47913950e984ee2a8135e562343522a94a0ceb89e65af29",
      // ).payment_credential
      lovelace_of(output.value) >= fee &&
        output.address.payment_credential ==
          address.from_verification_key(addr_cred).payment_credential
    },
  )
}

