// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world
import wixData from 'wix-data';

$w.onReady(function () {
	// Write your JavaScript here
	// To select an element by ID use: $w('#elementID')
	// Click 'Preview' to run your code
  let imageUrl = "potato";
	$w("#button4").onClick( async function(event) {
		  if($w("#input6").valid && $w("#input1").valid && $w("#input10").valid &&
         $w("#input2").valid && $w("#input9").valid && $w("#textBox1").valid && $w("#input11").valid && $w("#input7").valid) {
				    let uploadedFiles = await $w("#uploadButton1").uploadFiles()
            .catch( (uploadError) => {
              //console.log("File upload error: " + uploadError.errorCode);
              //console.log(uploadError.errorDescription);
              return;
            });
            imageUrl = uploadedFiles[0].fileUrl;
            let checkboxGroupOptions = $w("#checkboxGroup1").options;
            let discountable = checkboxGroupOptions[0].value;
            if(imageUrl != "potato") {
              let checkedArray = $w("#checkboxGroup1").selectedIndices;
              let checked = false;
              if(checkedArray.length > 0) {
                  checked = true;
              }
              let toInsert = {		 
              "_id": "",
              "productId": 0,  
              "title":        $w("#input6").value,
              "price":    parseInt($w("#input7").value),
              "description":        $w("#textBox1").value,
              "image":   imageUrl,
              "brand":    $w("#input1").value,
              "moveType":        $w("#input2").value,
              "color":   $w("#input10").value,
              "size":    $w("#input9").value,
              "discountable":       checked,
              "stock":   parseInt($w("#input11").value)
              };
              updateProduct(toInsert, $w("#dropdown1").value);
            }
    }
		else {
			//console.log("Fields are invalid");
		}
	});
});
export async function FindItemByTitle(title){
   await wixData.query("Inventory")
  .eq("title", title)
  .find()
  .then( (results) => {
    if(results.items.length > 0) {
      let items = results.items;
      let item = items[0];
      let id = item._id;
      let productId = item.productId;
      //console.log(id);
      //console.log(productId);
	  return [id, productId];
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
export async function updateProduct(product, title){
    FindItemByTitle(title).then((idAndproductId) => {
    //console.log(idAndproductId)
    product._id = idAndproductId[0];
    product.productId = idAndproductId[1];
    wixData.save("Inventory", product)
  .catch( (error) => {
		//console.log(error);
	} );
  } )
  .catch( (error) => {
    //console.log(error)
	return null;
  } );
}
