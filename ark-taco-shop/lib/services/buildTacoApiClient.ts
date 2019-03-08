import Client from "@arkecosystem/client";
import * as crypto from "@arkecosystem/crypto";

const version = 2;

async function createAndPostTransaction(
  sender,
  passphrase,
  recipient,
  tacoApiUri,
  params = {}
) {
  const client = new Client(tacoApiUri, version);
  // @ts-ignore
  const { price = 0 } = params;
  console.info("createAndPostTransaction", {
    sender,
    passphrase,
    client,
    price
  });

  const senderWallet = await getWallet(sender);
  console.log("TCL: senderWallet", { sender, senderWallet });
  const recipientWallet = await getWallet(recipient);
  console.log("TCL: recipientWallet", recipientWallet);

  console.info("createAndPostTransaction", { senderWallet, recipientWallet });

  try {
    const transaction = await postTransaction({
      recipient: recipientWallet.address,
      senderPublicKey: senderWallet.address,
      amount: price,
      passphrase
    });
    return transaction;
  } catch (error) {
    throw error;
  }

  async function getWallet(address) {
    try {
      const { data } = await client.resource("wallets").get(address);
      return data.data;
    } catch (error) {
      console.error("🚫 eror getting wallet", error);
      throw error;
    }
  }

  async function postTransaction({
    amount,
    recipient,
    senderPublicKey,
    passphrase
  }) {
    try {
      const transaction = crypto.transactionBuilder
        .transfer()
        .amount(amount)
        .vendorField(JSON.stringify(params))
        .recipientId(recipient)
        .senderPublicKey(senderPublicKey)
        .sign(passphrase)
        .getStruct();

      console.info("TRANSACTION", transaction);

      await client
        .resource("transactions")
        .create({ transactions: [transaction] });
      return transaction;
    } catch (error) {
      throw new Error(
        `An error has occured while posting the transaction: ${error}`
      );
    }
  }
}

async function fetchTransactions(tacoApiUri, sender, recipientId) {
  const client = new Client(tacoApiUri, version);
  const { data: { data: transactions = [] } = {} } = await client
    .resource("transactions")
    .all({ recipientId });
  console.log({ transactions: transactions.length });

  const filteredTransactions = (transactions || []).filter(function(
    transaction
  ) {
    return !!transaction.vendorField && transaction.sender === sender;
  });
  const {
    data: { data }
  } = await client.resource("transactions").get(filteredTransactions[0].id);

  return filteredTransactions.map(function(transaction) {
    try {
      return {
        ...transaction,
        vendorField: JSON.parse(transaction.vendorField)
      };
    } catch (err) {
      return transaction;
    }
  });
}

export default function buildTacoApiClient(config) {
  const { sender, passphrase, recipient, uri } = config;
  console.log("Building apiClient", { sender, passphrase, recipient, uri });

  return {
    listTransactions: async function listTransactions() {
      console.log("listing transaction");
      try {
        return fetchTransactions(uri, sender, recipient);
      } catch (error) {
        console.error("🚫 error fetching transactions", error);
        throw error;
      }
    },
    postTransaction: async function postTransaction(params) {
      console.log("posting transaction", params);
      try {
        const transaction = await createAndPostTransaction(
          sender,
          passphrase,
          recipient,
          uri,
          params
        );
        return transaction;
      } catch (error) {
        throw error;
      }
    }
  };
}
