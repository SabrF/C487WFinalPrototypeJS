// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world
import {session} from "wix-storage";
import wixLocation from 'wix-location';

$w.onReady(function () {
	// Write your JavaScript here
	if (session.getItem("OrderDetails") == null) {
		wixLocation.to("/");
	}
	$w("#confirmFrame").postMessage(session.getItem("OrderDetails"));
	session.removeItem("OrderDetails")
});
