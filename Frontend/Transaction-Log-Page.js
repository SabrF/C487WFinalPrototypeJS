// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world
import wixData from 'wix-data';
import { generatePDFUrl } from 'backend/pdfapi.jsw';
import { getTransactions } from 'backend/datasource.jsw';
import {session} from 'wix-storage';
import wixLocation from 'wix-location';

const workspaceIdentifier = "insert workspace";
let templateId = 357866;

$w.onReady(function () {
	// Write your JavaScript here
	// To select an element by ID use: $w('#elementID')
	// Click 'Preview' to run your code

  if (session.getItem("staffEmail") == null) {
		wixLocation.to("/")
	}

	$w("#datePicker1").onChange( (event) => {
    	FilterDatasetByDate();
	});
	$w("#datePicker2").onChange( (event) => {
    	FilterDatasetByDate();
	});
	$w("#button13").onClick( (event) => {
    	refresh();
	});
  $w('#download').target = '_blank';
  $w('#download').hide();

  /**
   * On "Generate PDF" button click send the API request to receive URL to PDF which is valid for 30 days
   * Then we can set the PDF URL as link value so we can open it in the new tab
   */
  $w('#generate').onClick(() => {
    $w('#download').show();
    $w('#download').disable();
    $w('#download').label = "Generating PDF...";
    
    getTransactions().then((transactions) => {
        generatePDFUrl(workspaceIdentifier, templateId, transactions) 
        .then((data) => {
          $w('#download').link = data.response; // This is URL to PDF that is valid for 30 days
          $w('#download').enable();
          $w('#download').label = "Open PDF";
       });
    });
    
   
  });

});

export async function refresh() {
	await $w('#dataset1').refresh();
}

export async function FilterDatasetByDate(){
 let yearValue = $w('#datePicker1').value.getFullYear();
 let monthValue = $w('#datePicker1').value.getMonth();
 let dayValue = $w('#datePicker1').value.getDate();
 let date1 = new Date(yearValue,monthValue,dayValue,0,0,0);
 
 yearValue = $w('#datePicker2').value.getFullYear();
 monthValue = $w('#datePicker2').value.getMonth();
 dayValue = $w('#datePicker2').value.getDate();
 let date2 = new Date(yearValue,monthValue,dayValue,23,59,59);
 await $w('#dataset1').setFilter(wixData.filter()
      .between("time", date1, date2)
    )
    .catch((err) => {
      //console.log('Error is: ' + err);
    });
}
