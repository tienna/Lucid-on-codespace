use aiken/collection/dict
use aiken/collection/list
use cardano/address.{Script}
use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction} as tx

pub type Action {
  Mint
  Burn
}

validator gift_card(token_name: ByteArray, utxo_ref: OutputReference) {
  spend(_d, _r, own_ref: OutputReference, transaction: Transaction) {
    let Transaction { mint, inputs, .. } = transaction

    expect Some(own_input) =
      list.find(inputs, fn(input) { input.output_reference == own_ref })

    expect Script(policy_id) = own_input.output.address.payment_credential

    expect [Pair(asset_name, amount)] =
      mint
        |> assets.tokens(policy_id)
        |> dict.to_pairs()

    amount == -1 && asset_name == token_name
  }

  mint(rdmr: Action, policy_id: PolicyId, transaction: Transaction) {
    // pattern matching với transaction để lấy ra inputs và mint từ transaction, trong đó mint chứa minted assets
    let Transaction { inputs, mint, .. } = transaction
    // hàm expect với mint sẽ trả lại asset_name và amount  theo  policy_id từ giao dịch tương tác với Smart contract
    expect [Pair(asset_name, amount)] =
      mint
        |> assets.tokens(policy_id)
        |> dict.to_pairs()

    when rdmr is {
      Mint -> {
        // kiểm tra utxo_ref có trong inputs không, amount == 1 và asset_name == token_name, tokenname là tên token được truyền vào 
        expect Some(_input) =
          list.find(inputs, fn(input) { input.output_reference == utxo_ref })
        amount == 1 && asset_name == token_name
      }
      // Unlock asset
      Burn -> amount == -1 && asset_name == token_name
    }
  }

  else(_) {
    fail
  }
}
