use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{OutputReference, Transaction}
// ^^^ Code above is unchanged. ^^^
use vodka_extra_signatories.{key_signed}
use vodka_validity_range.{valid_after}

pub type VestingDatum {
  lock_until: Int,
  owner: VerificationKeyHash,
  beneficiary: VerificationKeyHash,
}

validator vesting {
  // In principle, scripts can be used for different purpose (e.g. minting
  // assets). Here we make sure it's only used when 'spending' from a eUTxO
  spend(
    datum_opt: Option<VestingDatum>,
    _redeemer: Data,
    _input: OutputReference,
    tx: Transaction,
  ) {
    expect Some(datum) = datum_opt
    or {
      key_signed(tx.extra_signatories, datum.owner),
      and {
        key_signed(tx.extra_signatories, datum.beneficiary),
        valid_after(tx.validity_range, datum.lock_until),
      },
    }
  }

  else(_) {
    fail
  }
}
