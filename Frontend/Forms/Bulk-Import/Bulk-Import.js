// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world
import wixData from 'wix-data';
import wixLocation from 'wix-location';

$w.onReady(function () {
	// Wait for a message from the IFrame
	WaitForMessage();
});

function WaitForMessage() {
	$w("#formFrame").onMessage(event => {
		// Data array now received
		$w("#parseErrorText").hide();
		let CSVData = event.data;
		//console.table(CSVData);

		// Check for proper formatting and data
		if (CSVData.length == 0) {
			// No entries of data, throw away data
				// TODO: SHOW ERROR THAT FILE HAS NO ENTRIES
			$w("#parseErrorText").text = "No entries in file, import failed."
			$w("#parseErrorText").show('fade');
			return;
		}

		let DATA_COUNT = 10; // Number of data columns for each entry
		if (CSVData[0].length != DATA_COUNT) {
			// Data imported is not of proper length, throw away data
			$w("#parseErrorText").text = "Error in file parsing, entries do not have enough data"
			$w("#parseErrorText").show('fade');
			return;
		}
		
		ReadCSVData(CSVData)
	});
}

async function ReadCSVData(data) {
	// For each entry, get the data inside and write to inventory
	$w("#closeForm").disable();
	for (let index = 0; index < data.length; index++) {
		let entryResults = await CoverDataEntry(data[index], index);
		if (!entryResults) {
			break;
		}
	}
	if (imageToAdd.length > 0) {
		$w("#entryImageText").show('fade');
		$w("#entryImageButton").show('fade');
		$w("#entryImageSubmitButton").show("fade");
		CoverDataImages();
	}
	else {
		// No images to process
		//wixLocation.to("/refresh-inv");
	}
}

async function CoverDataEntry(entry, index) {
	// Array is ordered as follows: (title, productId, price, description, brand, moveType, color, size, discountable, stock)
	let prodID = entry[1];
	let findExisting = {
		items: []
	}
	try {
		let numID =  parseInt(prodID);
		findExisting = await wixData.query("Inventory").eq("productId", numID).find();
	} catch(error) {
		// Error in parsing productId
		$w("#parseErrorText").text = "Import stopped at entry #" + index + ", invalid productId value\n(integer only)";
		$w("#parseErrorText").show('fade');
		return false;
	}

	if (findExisting.items.length == 0) {
		// No entries match data entry, new product to add
		let newProduct = {
			title: entry[0],
			productId: parseInt(entry[1]),
			price: null,
			description: entry[3],
			image: null,
			brand: entry[4],
			moveType: entry[5],
			color: entry[6],
			size: entry[7],
			discountable: null,
			stock: null
		}

		// Check discountable value
		if (entry[8].toLowerCase().localeCompare("true") == 0 || entry[8].localeCompare("1") == 0 || entry[8].toLowerCase().localeCompare("one") == 0) {
			// Set as true
			newProduct.discountable = true;
		}
		else if (entry[8].toLowerCase().localeCompare("false") == 0 || entry[8].localeCompare("0") == 0 || entry[8].toLowerCase().localeCompare("zero") == 0) {
			// Set as false
			newProduct.discountable = false;
		}
		else {
			// Error in parsing entry, stop import
			$w("#parseErrorText").text = "Import stopped at entry #" + index + ", invalid discountable value\n('true/false', '1/0', or 'one/zero')";
			$w("#parseErrorText").show('fade');
			return false;
		}

		// Check price value
		try {
			newProduct.price = parseFloat(parseFloat(entry[2]).toFixed(2));
		} catch(error) {
			// Error in parsing value
			$w("#parseErrorText").text = "Import stopped at entry #" + index + ", invalid price value\n(integer or float)";
			$w("#parseErrorText").show('fade');
			return false;
		}

		// Check stock value
		try {
			newProduct.stock = parseInt(entry[9]);
		} catch(error) {
			// Error in parsing value
			$w("#parseErrorText").text = "Import stopped at entry #" + index + ", invalid stock value\n(integer only)";
			$w("#parseErrorText").show('fade');
			return false;
		}

		// Insert product
		let prod = await wixData.insert("Inventory", newProduct);
		imageToAdd.push({_id: prod._id, productId: prod.productId});
		return true;
	}
	else {
		// Product already exists, update information
		let existingProduct = {
			title: entry[0],
			productId: parseInt(entry[1]),
			price: null,
			description: entry[3],
			image: findExisting.items[0].image,
			brand: entry[4],
			moveType: entry[5],
			color: entry[6],
			size: entry[7],
			discountable: null,
			stock: null,
			_id: findExisting.items[0]._id
		}
		
		// Check discountable value
		if (entry[8].toLowerCase().localeCompare("true") == 0 || entry[8].localeCompare("1") == 0 || entry[8].toLowerCase().localeCompare("one") == 0) {
			// Set as true
			existingProduct.discountable = true;
		}
		else if (entry[8].toLowerCase().localeCompare("false") == 0 || entry[8].localeCompare("0") == 0 || entry[8].toLowerCase().localeCompare("zero") == 0) {
			// Set as false
			existingProduct.discountable = false;
		}
		else {
			// Error in parsing entry, stop import
			$w("#parseErrorText").text = "Import stopped at entry #" + index + ", invalid discountable value\n('true/false', '1/0', or 'one/zero')";
			$w("#parseErrorText").show('fade');
			return false;
		}

		// Check price value
		try {
			existingProduct.price = parseFloat(parseFloat(entry[2]).toFixed(2));
		} catch(error) {
			// Error in parsing value
			$w("#parseErrorText").text = "Import stopped at entry #" + index + ", invalid price value\n(integer or float)";
			$w("#parseErrorText").show('fade');
			return false;
		}

		// Check stock value
		try {
			existingProduct.stock = parseInt(entry[9]);
		} catch(error) {
			// Error in parsing value
			$w("#parseErrorText").text = "Import stopped at entry #" + index + ", invalid stock value\n(integer only)";
			$w("#parseErrorText").show('fade');
			return false;
		}

		// Update product
		await wixData.update("Inventory", existingProduct);
		return Promise.resolve(true);
	}
}

var imageToAdd = [];
async function CoverDataImages() {
	// Allow for input image for entry at end of list that has been added to inventory
	$w("#entryImageText").text = "ID #" + imageToAdd[imageToAdd.length-1].productId + ":";
	$w("#entryImageButton").enable();
	$w("#entryImageSubmitButton").enable();
}

export async function entryImageSubmitButton_click(event) {
	// Disable buttons
	$w("#entryImageErrorText").hide();
	$w("#entryImageButton").disable();
	$w("#entryImageSubmitButton").disable();
	
	// Take image
	if ($w("#entryImageButton").value.length != 1) {
		// No files selected or something wierd happened
		$w("#entryImageErrorText").text = "No files have been selected, try again";
		$w("#entryImageErrorText").show("fade");
		$w("#entryImageButton").enable();
		$w("#entryImageSubmitButton").enable();
		return;
	}
	let files = await $w("#entryImageButton").uploadFiles()
	
	// Save file url
	//console.log("image saved");
	let updateImage = await wixData.get("Inventory", imageToAdd[imageToAdd.length-1]._id);
	//console.log(updateImage)
	updateImage.image = files[0].fileUrl;
	wixData.update("Inventory", updateImage)
	.then(_ => {
		imageToAdd.pop(); // Remove item from list
		// Check if more products need images
		if (imageToAdd.length > 0) {
			// More images
			$w("#entryImageButton").reset()
			CoverDataImages();
		}
		else {
			// No more images, close form and refresh inventory
			wixLocation.to("/refresh-inv");
		}
	})
}
