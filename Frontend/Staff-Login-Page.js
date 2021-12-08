// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world
import wixData from 'wix-data';
import {session} from 'wix-storage';
import wixLocation from 'wix-location';
import CryptoJS from 'crypto-js';

$w.onReady(function () {
	// Check that special account is logged in
	if (session.getItem("accountEmail") == null || session.getItem("accountEmail").localeCompare("specialWhole@gmail.com") != 0 || session.getItem("staffEmail") != null) {
		wixLocation.to("/");
	}
});


export function loginStaffButton_click(event) {
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
	wixData.query("StaffAccounts")
	.eq("title", $w("#emailField").value)
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
			session.removeItem("accountEmail")
			session.setItem("staffEmail", results.items[0].email);
			wixLocation.to("/dashboard");
		}
		else {
			// Password is incorrect, show error message
			$w("#passwordField").value = "";
			$w("#loginFailText").show("fade");
			return;
		}
	}) 
}
