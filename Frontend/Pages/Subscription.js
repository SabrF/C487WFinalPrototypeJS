// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world

// Imports
import wixData from 'wix-data';
import {session} from 'wix-storage';
import wixLocation from 'wix-location';

// JS Functions
$w.onReady(function () {
	// Check to see if the user visiting the page is a wholesaler
	if (session.getItem("accountEmail") == null || session.getItem("accountEmail").trim().localeCompare("specialWhole@gmail.com") == 0) {
		// User is not logged in, redirect to home and display error
		session.setItem("displayError", "BadURL");
		wixLocation.to("/");
	}

	// User is logged in, display subscriptions in repeater
	let email = session.getItem("accountEmail");
	wixData.query("WholesalerAccounts")
	.contains("email", email)
	.find()
	.then(results => {
		if (results.items.length != 1) {
			return; // Something odd happened
		}
	
		let wholeSubs = results.items[0].subscriptions;
		if (wholeSubs == undefined) {
			// Subscriptions list is empty
			$w("#emptySubsLabel").show();
			return;
		}

		let subIDs = [];
		while (wholeSubs.localeCompare(";") != 0) {
			let nextProdID = wholeSubs.substring(1, wholeSubs.indexOf(";", 1));
			wholeSubs = wholeSubs.replace(";" + nextProdID + ";", ";");
			subIDs.push(parseInt(nextProdID));
		}
		wixData.query("Inventory")
		.hasSome("productId", subIDs)
		.find()
		.then(repSubs => {
			$w("#subRepeater").data = repSubs.items; // Check this later
			$w("#subRepeater").forEachItem( ($item, itemData, index) => {
				$item("#productName").text = itemData.title;
				$item("#productDesc").text = itemData.description;
				$item("#productImage").src = itemData.image;
				let price = (itemData.price * ((100 - results.items[0].discount)/100)).toFixed(2);
				$item("#productPrice").text = price.toString();
				$item("#unsubButton").onClick( (event) => {
					// Remove subscription
					let prodID = itemData.productId;
					unsubscribeButton_click(event, prodID);
				})
			})
			$w("#subRepeater").show();
		})
	})
})

export function unsubscribeButton_click(event, prodID) {
  // Unsubscribe from product
  let email = session.getItem("accountEmail");
  wixData.query("WholesalerAccounts")
  .contains("email", email)
  .find()
  .then(results => {
    if (results.items.length != 1) {
      return; // Something odd happened
    }

    let subs = results.items[0].subscriptions;
    let newSubs = subs.replace(";" + prodID + ";", ";");
    if (newSubs.length == 1) newSubs = undefined;
    let updatedSubs = results.items[0];
    updatedSubs.subscriptions = newSubs;
    wixData.update("WholesalerAccounts", updatedSubs)
    .then(results => {
      // Refresh page
      wixLocation.to("/refresh-subs");
    })
  })
}
