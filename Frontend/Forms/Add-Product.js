// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world
import wixData from 'wix-data';

$w.onReady(function () {
	// Write your JavaScript here
	// To select an element by ID use: $w('#elementID')
	// Click 'Preview' to run your code
  let imageUrl = "potato";
  //let newId = GenerateProductId();
	$w("#button4").onClick( (event) => {
		  if($w("#input6").valid && $w("#input1").valid && $w("#input10").valid && $w("#input2").valid 
        && $w("#input9").valid && $w("#textBox1").valid && $w("#input11").valid && $w("#input7").valid) {
          
      $w("#uploadButton2").uploadFiles()
        .then( (uploadedFiles) => {
        imageUrl = uploadedFiles[0].fileUrl;
      })
      .catch( (uploadError) => {
        //console.log("File upload error: " + uploadError.errorCode);
        //console.log(uploadError.errorDescription);
      });
      if(imageUrl != "potato") {
         let checkedArray = $w("#checkboxGroup1").selectedIndices;
         let checked = false;
         if(checkedArray.length > 0) {
            checked = true;
         }
         let toInsert = {
         "title":        $w("#input6").value,
         "productId":   Math.floor(Math.random() * (9999 - 1000) + 1000),
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
       insertProduct(toInsert);
       }
			 }
		 else {
			 //console.log("Fields are invalid");
		 }
	});
});
export async function insertProduct(product){
   await wixData.insert("Inventory", product)
	.then( (results) => {
		//console.log("Product has been added");
	} )
	.catch( (error) => {
		//console.log(error);
	} );
}
