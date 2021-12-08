// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world
import wixData from 'wix-data';
$w.onReady(function () {
	// Write your JavaScript here
	// To select an element by ID use: $w('#elementID')
	// Click 'Preview' to run your code
	$w("#button4").onClick( (event) => {
		  if($w("#dropdown1").value != "") {
			  FindItemByTitleAndRemove($w("#dropdown1").value);
		  }
	});
});
export async function FindItemByTitleAndRemove(title){
   await wixData.query("Inventory")
  .eq("title", title)
  .find()
  .then( (results) => {
    if(results.items.length > 0) {
      let items = results.items;
      let item = items[0];
      let id = item._id;
      RemoveItem(id);
    } else {
      //console.log("Selected item no longer exists")
	  return null;
    }
  } )
  .catch( (error) => {
    //console.log(error)
	return null;
  } );
}
export async function RemoveItem(id) {
	await wixData.remove("Inventory", id)
    .then( (results) => {
    //console.log("Removal of item: " + id + " successful");
  } )
  .catch( (error) => {
    //console.log(error);
  } );
}
