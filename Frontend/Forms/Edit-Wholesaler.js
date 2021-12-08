// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world
import CryptoJS from 'crypto-js';
import wixData from 'wix-data';
// JS Functions
$w.onReady(function () {
	// Write your JavaScript here
	// To select an element by ID use: $w('#elementID')
	// Click 'Preview' to run your code
	$w("#button4").onClick( (event) => {
		 if($w("#dropdown1").value != "" && $w("#input6").valid && $w("#input7").valid && $w("#input4").valid 
		 	&& $w("#input5").valid){
				 if($w("#checkboxGroup1").valid == false){
					 //console.log("Please confirm the changes.");
				 }
				 else if ($w("#checkboxGroup1").valid){
				 	let toInsert = {
         				"Company": $w("#input6").value,
         				"Account Holder": $w("#input7").value,
        				"Discount": $w("#input4").value,
         				"Minimum": $w("#input5").value,
			 		};
			    let Username = FindUserByTitle($w("#dropdown1").value)
				updateWholesaler(toInsert);
			 	}
				 }
		 else {
			 //console.log("Fields are invalid");
		}		
	})
})

export async function FindUserByTitle(title){
   await wixData.query("WholesalerAccounts")
  .eq("title", title)
  .find()
  .then( (results) => {
    if(results.items.length > 0) {
      let items = results.items;
      let item = items[0];
      let id = item._id;
	  return id;
    } else {
      //console.log("Selected Wholesaler Account no longer exists")
	  return null;
    }
  } )
  .catch( (error) => {
    //console.log(error)
	return null;
  } );
}

export async function updateWholesaler(Username) {
   wixData.save("WholesalerAccounts", Username)
	.then( (results) => {
		//console.log("Wholesaler account has been updated");
	} )
	.catch( (error) => {
		//console.log(error);
	} )
}
