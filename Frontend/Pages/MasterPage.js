// The code in this file will load on every page of your site
import {session} from 'wix-storage';
import wixLocation from 'wix-location';

$w.onReady(function () {
	// Check to see if the user is a wholesaler
	if (session.getItem("accountEmail") != null && session.getItem("accountEmail").trim().localeCompare("specialWhole@gmail.com") != 0) {
		// User is logged in, change login to logout and it's action
		$w("#subLine").show();
		$w("#subButton").show();
		$w("#subButton").enable();
		$w("#loginButton").label = "LOGOUT";
		$w("#loginButton").onClick(function() {
			session.removeItem("accountEmail");
			wixLocation.to("/refresh");
		})
	}
	else if (session.getItem("accountEmail") != null && session.getItem("accountEmail").trim().localeCompare("specialWhole@gmail.com") == 0) {
		$w("#loginButton").label = "S-LOGIN";
		$w("#loginButton").link = "/staff-login";
	}
	else if (session.getItem("staffEmail") != null) {
		$w("#subButton").label = "DASHBOARD";
		$w("#subLine").show();
		$w("#subButton").show();
		$w("#subButton").enable();
		$w("#loginButton").label = "LOGOUT";
		$w("#loginButton").onClick(function() {
			session.removeItem("staffEmail");
			wixLocation.to("/refresh");
		})
	}
});

export function subButton_click(event) {
	// Go to subscriptions page
	if (session.getItem("staffEmail") != null) {
		wixLocation.to("/dashboard");
	}
	else {
		wixLocation.to("/subscriptions");
	}
}
