// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world

// Imports
import wixData from 'wix-data';
import {session} from 'wix-storage';
import wixLocation from 'wix-location';
import CryptoJS from 'crypto-js';

// JS Functions
$w.onReady(function () {
	if (session.getItem("accountEmail") != null) {
		// User is already logged in, redirect to home
		wixLocation.to("/");
	}
});

/**
*	Adds an event handler that runs when the element is clicked.
	[Read more](https://www.wix.com/corvid/reference/$w.ClickableMixin.html#onClick)
*	 @param {$w.MouseEvent} event
*/
export function loginWholesalerButton_click(event) {
	// Reset login variables
	$w("#loginFailText").hide();

	// Check to see if both fields are filled in
	if ($w("#emailField").value.trim() == "") {
		$w("#emailField").value = "";
		$w("#loginFailText").text = "Email is missing, try again";
		$w("#loginFailText").show("fade");
		return;
	} 
	if ($w("#passwordField").value.trim() == "") {
		$w("#passwordField").value = "";
		$w("#loginFailText").text = "Password is missing, try again";
		$w("#loginFailText").show("fade");
		return;
	}
	
	// Convert the password to the proper format
	wixData.query("WholesalerAccounts")
	.eq("email", $w("#emailField").value)
	.find()
	.then(results => {
		// If not found, display error
		if (results.items.length == 0) {
			// No matching accounts by email, show error
			$w("#passwordField").value = "";
			$w("#loginFailText").text = "Email or password is incorrect, try again";
			$w("#loginFailText").show("fade");
			return;
		}

		// Continue validation process on found account
		let userPass = results.items[0].salt + $w("#passwordField").value;
		let hash = CryptoJS.SHA256(userPass).toString();
		if (hash.toUpperCase().localeCompare(results.items[0].password) == 0) {
			// Passwords match, being login process
			session.setItem("accountEmail", results.items[0].email);
			wixLocation.to("/");
		}
		else {
			// Password is incorrect, show error message
			$w("#passwordField").value = "";
			$w("#loginFailText").show("fade");
			return;
		}
	})
}
