use aiken/collection/dict
use aiken/collection/list
use cardano/address.{Script}
use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction} as tx

pub type Action {
  Minting
  Burning
}

validator gift_card(token_name: ByteArray) {
  spend(_d, _r, own_ref: OutputReference, transaction: Transaction) {
    // pattern matching với transaction để lấy ra inputs và spend từ transaction. 
    let Transaction { mint, inputs, .. } = transaction
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
    // pattern matching với transaction để lấy ra inputs và mint từ transaction, trong đó mint chứa minted assets
    // PolicyId
    // asset_name = BK02
    // soluong = 1

    let Transaction { mint, .. } = transaction
    // hàm expect với mint sẽ trả lại asset_name và amount  theo  policy_id từ giao dịch tương tác với Smart contract
    expect [Pair(asset_name, amount)] =
      mint
        |> assets.tokens(policy_id)
        |> dict.to_pairs()

    when rdmr is {
      Minting -> amount == 1 && asset_name == token_name
      // Unlock asset
      Burning -> amount == -1 && asset_name == token_name
    }
  }

  else(_) {
    fail
  }
}
