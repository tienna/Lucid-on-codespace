use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{OutputReference, Transaction} as tx

pub type MyData {
  a: Int,
  b: VerificationKeyHash,
  c: ByteArray,
}

validator validate(my_data: MyData) {
  spend(
    _datum_opt: Option<MyData>,
    redeemer: MyData,
    _input: OutputReference,
    _tx: Transaction,
  ) {
    my_data.b == redeemer.b
  }

  else(_) {
    fail
  }
}
