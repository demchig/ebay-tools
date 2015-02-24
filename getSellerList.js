var ebayTradingAPI = require('../node-ebay-trading-api');
require('date-utils');
var fs = require('fs');
var util = require("util");


var config = require('./config.json');

ebayTradingAPI.setUserToken(config.eBayAuthToken);

//ebayTradingAPI.debug(true);

var userID = process.argv[2];
console.warn('user id:' + userID);

if (!userID) {
    console.log("Please pass userID");
    process.exit(9);
}

var pageNumber = 1;
var recursive = false;
if (process.argv[3]) {
    pageNumber = process.argv[3];
}
if( "all" == pageNumber ){
	pageNumber = 1;
	recursive = true;
}

var reqArgs = {
    "UserID": userID,
    //"DetailLevel": "ReturnAll",
    "EndTimeFrom": "2014-12-01 00:00:00",
    "EndTimeTo": "2015-03-30 00:00:00",
    "CategoryID":"625",
    "Pagination": {
        "EntriesPerPage": 200,
        "PageNumber": pageNumber
    }
};


ebayTradingAPI.call("GetSellerList", reqArgs, recursiveCall);


function recursiveCall(result) {
    //console.log(result.GetSellerListResponse);
    //console.log("Errors:" + result.GetSellerListResponse.Errors);

    if (result.GetSellerListResponse.ItemArray) {
        var list = result.GetSellerListResponse.ItemArray;
        var pagination = result.GetSellerListResponse.PaginationResult;

        //inspect(list);
        inspect(pagination);
        inspect(reqArgs);
        display2(list);

        if(recursive && pagination && pagination[0].TotalNumberOfPages[0] > reqArgs.Pagination.PageNumber){
        	// recursive call for next page
        	reqArgs.Pagination.PageNumber++;
        	ebayTradingAPI.call("GetSellerList", reqArgs, recursiveCall);
        }

        save2File(list);

    } else {
        console.error("There is no result for : " + userID);
    }
}


function inspect(value) {
    console.log(util.inspect(value, false, null));
}


function save2File(list) {
    var dt = new Date();
    var saveFile = "./data/Out-" + userID + "-" + dt.toFormat("YYYYMMDDHH24MISS") + ".json";
    fs.writeFileSync(saveFile, JSON.stringify(list));
    console.log("Saved to " + saveFile);
}


function display(list){
	var items = list[0].Item;
	for(var i in items){
		var item = items[i];

    	var outAr = {
    		"ItemID" : item.ItemID[0],
    		"Title" : item.Title[0],
    		"SKU" : '',
    		"CategoryID" : item.PrimaryCategory[0].CategoryID[0],
    		"StartPrice" : item.StartPrice[0]['_'],
    		"ConditionID" : "",
    		"ConditionDescription" : "",
    		"ViewItemURL" : item.ListingDetails[0].ViewItemURL[0],
    		"StartTime" : item.ListingDetails[0].StartTime[0],
    		"EndTime" : item.ListingDetails[0].EndTime[0],
    		"ItemSpecifics" : "",
    		"UPC" : "",
    	};

		if( "SKU" in item ){
			outAr.SKU = item.SKU[0];
		}
		if( "ConditionID" in item ){
			outAr.ConditionID = item.ConditionID[0];
		}
		if( "ConditionDescription" in item ){
			outAr.ConditionDescription = item.ConditionDescription[0];
		}

    	var itemSpec = "";

    	if( 'ItemSpecifics' in item ){
	    	var itemSpecs = item.ItemSpecifics[0].NameValueList;
	    	//console.log(itemSpecs);
	    	var itemSpecAr = [];
	    	for(var k in itemSpecs){
	    		itemSpecAr.push(itemSpecs[k].Name + "::" + itemSpecs[k].Value);
	    		if( itemSpecs[k].Name == "UPC" ){
	    			outAr.UPC = itemSpecs[k].Value;
	    		}
	    	}    		
	    	itemSpec = itemSpecAr.join("#");
    	}

    	outAr.ItemSpecifics = itemSpec;

		console.log(outAr);
		//inspect(item);
	}
}


function display2(list){
	var items = list[0].Item;
	for(var i in items){
		var item = items[i];

		console.log(item.ItemID[0]);
		//inspect(item);
	}
}