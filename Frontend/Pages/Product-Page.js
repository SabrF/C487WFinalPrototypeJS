// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world
import wixData from 'wix-data';
import {session} from 'wix-storage';
import wixLocation from 'wix-location';

// JS Functions
$w.onReady(function () {
	// Check to see if the user is a wholesaler
  let email = session.getItem("accountEmail");
  if (email != null) {
    // Wholesaler is logged in
    wixData.query("WholesalerAccounts")
    .contains("email", email)
    .find()
    .then(results => {
      // Check to see the user is already subscribed to the product
      if (results.items.length != 1) {
        return; // Something odd happened
      }

      let subs = results.items[0].subscriptions;
      let prodID = $w("#textProductId");
      if (subs != undefined && subs.indexOf(";" + prodID + ";") != -1) {
        // Product is in subscriptions, change subscribe button to unsubscribe interaction
        $w("#subscribeButton").label = "Unsubscribe";
        $w("#subscribeButton").enable();
        $w("#subscribeButton").show();

      }
      else {
        // User is not subscribed to product, display normal button
        $w("#subscribeButton").enable();
        $w("#subscribeButton").show();
      }
    })
  }
});

export function addToCartButton_click(event) {
  // Add this product to the cart string stored in memory
  if (session.getItem("cart") == null) {
    // Cart is empty, add product to empty cart
    let prodID = $w("#textProductId").text;
    session.setItem("cart", prodID + "-" + $w("#quantityInput").value + ";");
  }
  else {
    // Add product to existing cart
    let oldCart = session.getItem("cart");
    let prodID = $w("#textProductId").text;
    let findProduct = oldCart.indexOf(prodID + "-");
    let newCart = "";
    if (findProduct == -1) {
      // Product not in cart, add to cart
      newCart = oldCart + prodID + "-" + $w("#quantityInput").value + ";"
      session.setItem("cart", newCart);
    }
    else {
      // Product already in cart, increment quantity
      let newQuantity = parseInt(oldCart.substring(oldCart.indexOf("-", findProduct)+1, oldCart.indexOf(";", findProduct))) + parseInt($w("#quantityInput").value);
      let medCart = oldCart.substring(0, findProduct) + prodID + "-" + newQuantity + ";";
      newCart = medCart + medCart.substring(medCart.indexOf(";", findProduct)+1);
      session.setItem("cart", newCart);
    }
  }
  $w("#addToCartButton").label = "Added";
  //console.log(session.getItem("cart"));
}

export function subscribeButton_click(event) {
  let email = session.getItem("accountEmail");
  if (email == null) return;
  
  // Add product to subscriptions
  $w("#subscribeButton").disable();
  let prodID = $w("#textProductId").text;
  if ($w("#subscribeButton").label == "Unsubscribe") {
    unsubscribeButton_click(event, prodID)
    return;
  }
  wixData.query("WholesalerAccounts")
  .contains("email", email)
  .find()
  .then(results => {
    if (results.items.length != 1) {
      return; // Something odd happened
    }

    let subs = results.items[0].subscriptions; 
    let newSubs = subs + prodID + ";";
    if (subs == undefined) newSubs = ";" + prodID + ";";
    let updatedSubs = results.items[0];
    updatedSubs.subscriptions = newSubs;
    wixData.update("WholesalerAccounts", updatedSubs)
    .then(results => {
      // Change subscribe button to unsubscribe
      $w("#subscribeButton").label = "Unsubscribe";
      $w("#subscribeButton").enable();
    })
  })
}

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
      // Change unsubscribe button to subscribe
      $w("#subscribeButton").label = "Subscribe";
      $w("#subscribeButton").enable();
    })
  })
}
