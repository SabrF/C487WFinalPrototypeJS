// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-worldF
import wixData from 'wix-data';
import {session} from 'wix-storage';
import wixLocation from 'wix-location';

let pageNotReady = false;
$w.onReady(function () {
	removeEmpty();

	// Load cart
	loadCart().then(results => {$w("#repeater1").show()});
});

function removeEmpty() {
	let cart = session.getItem("cart");
	if (cart != null && cart.localeCompare("") != 0) {
		let cursor = 0;
		let moreItems = true;
		while(moreItems) {
			let semiPos = cart.indexOf(";", cursor);
			let dashPos = cart.indexOf("-", cursor);
			let quantity = parseInt(cart.substring(dashPos + 1, semiPos));
			
			if (quantity == 0) {
				// Remove item from cart
				let newCart = cart.substring(0, cursor) + cart.substring(semiPos+1);
				session.setItem("cart", newCart);
				if (newCart.localeCompare("") == 0) {
					session.removeItem("cart");
					return;
				}
			}
			else {
				cursor = semiPos + 1;
			}
			cart = session.getItem("cart")
			if (cursor >= cart.length) {
				moreItems = false;
			}
		}
	}
}

//create variable to store total
var subTotal = 0;
async function loadCart() {

	// Create cart data array
	let cart = session.getItem("cart");
	if (cart == null || cart.localeCompare("") == 0) {
		// Cart is empty, end this code
		$w("#repeater1").data = [];
		$w("#emptyCartLabel").show();
		return;
	}

	// Check to see if its a wholesaler
	let email = session.getItem("accountEmail");
	let account = null;
	if (email != null) {
		let results = await wixData.query("WholesalerAccounts").eq("email", email).find();
		if (results.items.length != 1) {
			return; // Something wierd happened
		}
		account = results.items[0];
	}

	let cursor = 0;
	let cartData = [];
	let moreItems = true;
	while(moreItems) {
		let semiPos = cart.indexOf(";", cursor);
		let productString = cart.substring(cursor, semiPos);
		let dashPos = productString.indexOf("-");
		let stringID = productString.substring(0, dashPos);
		let stringQuantity = productString.substring(dashPos + 1, semiPos);

		let results = await wixData.query("Inventory").eq("productId", parseInt(stringID)).find();
		let price = results.items[0].price;
		if (account != null && results.items[0].discountable) {
			price = (price * ((100 - account.discount)/100)).toFixed(2);
		}
		subTotal = subTotal + (price * parseInt(stringQuantity));
		let name = results.items[0].title;
		let image = results.items[0].image;
		cartData.push({
			"price": price,
			"image": image,
			"name": name,
			"quantity": stringQuantity,
			"_id": stringID
		});
		cursor = semiPos + 1;
		if (cursor >= cart.length) {
			moreItems = false;
		}
	}
	let fixedSub = subTotal.toFixed(2);
	$w("#html1").postMessage(fixedSub);
	$w("#html2").postMessage(fixedSub);

	// Set repeater data
	$w("#repeater1").data = cartData;
	$w("#repeater1").forEachItem(($item, itemData, index) => {
		$item("#cartPrice").text = itemData.price.toString();
		$item("#cartImage").src = itemData.image;
		$item("#cartQuantity").value = itemData.quantity;
		$item("#cartName").text = itemData.name;
		$item("#cartRemove").onClick( (event) => {
			let oldCart = session.getItem("cart");
			let idPos = oldCart.indexOf(itemData._id + "-");
			let newCart = oldCart.substring(0, idPos) + oldCart.substring(oldCart.indexOf(";", idPos) + 1);  // format: productid - quantity;
			session.setItem("cart", newCart);
			wixLocation.to("/refresh-cart");
		});
		$item("#cartQuantity").onChange((event) => {
			let newQuantity = parseInt($item("#cartQuantity").value)
			if (isNaN(newQuantity)) {
				return;
			}
			if (newQuantity < 0) {
				newQuantity = 0
				$item("#cartQuantity").value = newQuantity.toString();
			}
			let cart = session.getItem("cart")
			let idPos = cart.indexOf(itemData._id + "-");
			let semiPos = cart.indexOf(";", idPos);
			let newCart = cart.substring(0, idPos) + itemData._id + "-" + newQuantity + cart.substring(semiPos)
			session.setItem("cart", newCart)
			updateSubtotal();
		})
	});
}


async function updateSubtotal() {
	subTotal = 0;
	let cart = session.getItem("cart");
	if (cart == null || cart.localeCompare("") == 0) {
		// Cart is empty, end this code
		$w("#repeater1").data = [];
		$w("#emptyCartLabel").show();
		$w("#html1").postMessage(subTotal);
		$w("#html2").postMessage(subTotal);
		return;
	}

	let cursor = 0;
	let moreItems = true;
	while(moreItems) {
		let semiPos = cart.indexOf(";", cursor);
		let productString = cart.substring(cursor, semiPos);
		let dashPos = productString.indexOf("-");
		let stringID = productString.substring(0, dashPos);
		let stringQuantity = productString.substring(dashPos + 1, semiPos);

		let results = await wixData.query("Inventory").eq("productId", parseInt(stringID)).find();
		let price = results.items[0].price;
		subTotal = subTotal + (price * parseInt(stringQuantity));
		cursor = semiPos + 1;
		if (cursor >= cart.length) {
			moreItems = false;
		}
	}
	let fixedSub = subTotal.toFixed(2);
	$w("#html1").postMessage(fixedSub);
	$w("#html2").postMessage(fixedSub);
	
}


/**
*	Adds an event handler that runs when the element is clicked.
	[Read more](https://www.wix.com/corvid/reference/$w.ClickableMixin.html#onClick)
*	 @param {$w.MouseEvent} event
*/
export function button12_click(event) {
	session.setItem("total", subTotal)
	wixLocation.to("/order-creds")
}
