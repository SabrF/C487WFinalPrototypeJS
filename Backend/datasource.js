// .jsw files enable you to write functions that run on the server side
// Test any backend function by clicking the "Play" button on the left side of the code panel
// About testing backend functions: https://support.wix.com/en/article/velo-testing-your-backend-functions
import wixData from 'wix-data';

export async function getTransactions() {
  return wixData.query("TransactionLog")
  .find()
  .then((data) => {
    return Promise.resolve(data.items.map((transaction) => {
      return transaction;
    }));
  });
}
