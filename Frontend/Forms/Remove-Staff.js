// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world

import wixLocation from 'wix-location';
import wixData from 'wix-data';
$w.onReady(async function () {
  // Write your JavaScript here
	// To select an element by ID use: $w('#elementID')
	// Click 'Preview' to run your code
	$w("#button4").onClick( async(event) => {
		  if($w("#dropdown1").value != "" && $w("#checkboxGroup1").valid && $w("#dropdown1").value != null) {
        // console.log(typeof $w("#dropdown1").value)
			  let Username  = FindStaffByTitle($w("#dropdown1").value).then( Username => {
          //console.log(Username);
			    if(Username != null) {
				    RemoveItem(Username);
			    }
        })
		  }
	});
});


export async function FindStaffByTitle(title){
  let results = await wixData.query("StaffAccounts").eq("title", title).find();
  if(results.items.length > 0){
    //console.log(results.items[0]._id);
    return results.items[0]._id;
  }
  else{return null;}
}


export async function RemoveItem(Username) {
	await wixData.remove("StaffAccounts", Username)
    .then( (results) => {
    //console.log("Removal of Staff Account: " + Username + " successful");
    wixLocation.to("/refresh-staff");
  } )
  .catch( (error) => {
    //console.log(error);
  } );
}
