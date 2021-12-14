// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world
import wixData from 'wix-data';
import {session} from 'wix-storage';
import wixLocation from 'wix-location';

// JS Functions

$w.onReady(function () {
	// Wait for a message from the IFrame
	if (session.getItem("cart") == null || session.getItem("cart").localeCompare("") == 0) {
		wixLocation.to("/");
	} 
	
	$w("#submitFailText").hide();
	WaitForMessage();
});

function WaitForMessage() {
	$w("#credFrame").onMessage(event => {
		$w("#submitFailText").hide();
		// Data from credForm received
		let vaildForm = event.data;
		
		finalizeTransaction(vaildForm)
	});
}
export function finalizeTransaction(data){
	//Check if all fields are filled in
	if(data.valid === false){
		$w("#submitFailText").show("fade");
		return;
	}

	//Send Cart info from session storage to IFrame
	let cartInfo = session.getItem("cart");
	$w('#credFrame').postMessage(cartInfo);

	submitButton_click(data)
}
 export async function submitButton_click(data){
	 let cartInfo = session.getItem("cart");
	 let total = session.getItem("total");
	 let numTotal = parseFloat(parseFloat(total).toFixed(2))
	 var orderNum = generateOrderNumber();
	 let dataToInsert = data;
	 if(cartInfo != null){
		 dataToInsert = {
		 "orderNumber" : orderNum,
		 "title": data.fName,
		 "lastName": data.lName,
		 "recipient1": data.email,
		 "shippingAddress": data.shipAddress,
		 "purchasedItems": cartInfo,
		 "total": numTotal,
		 "time": data.date
	 	};
	 }

	 session.setItem("OrderDetails", data.fName + "-" + orderNum + ";" + numTotal + "/" + data.shipAddress);
	 
	 wixData.insert("TransactionLog", dataToInsert)
	 	.then((results) =>{
			 //console.log("Transaction added")
			 session.removeItem("cart");
			 session.removeItem("total");
			 wixLocation.to("/confirmation-message")
		 })
		 .catch((err) =>{
			 //console.log(err);
		 });
 }

 function generateOrderNumber(){
	 return Math.floor(100000 + Math.random() * 900000);
 }
