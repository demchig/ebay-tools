var xml2js = require('xml2js');
var fs = require('fs');
var ebayTradingAPI = require('node-ebay-trading-api');
var json2csv = require('json2csv');


var config = require('./config.json');

ebayTradingAPI.setUserToken(config.eBayAuthToken);

//console.log(ebayTradingAPI.getUserToken());

var itemID = process.argv[2];
console.warn('item id:' + itemID);

if( ! itemID ){
	console.log("Please pass item id!!");
	process.exit(9);
}

ebayTradingAPI.call(
	"GetItem",
	{
		"ItemID" : itemID,
		"DetailLevel" : "ReturnAll",
		"IncludeItemSpecifics" : 1
	},
	function(result){
		//console.log(result.GetItemResponse.Errors);

		var item = result.GetItemResponse.Item[0];
		//console.log(item);

		// ItemID,Title,SKU,CategoryID,StartPrice,ConditionID,ConditionDescription,ItemSpecifics,ViewItemURL,StartTime,EndTime,PictureURL
    	var csvJson = {
    		"ItemID" : item.ItemID[0],
    		"Title" : item.Title[0],
    		"SKU" : '',
    		"CategoryID" : item.PrimaryCategory[0].CategoryID[0],
    		"StartPrice" : item.StartPrice[0]['_'],
    		"ConditionID" : "",
    		"ConditionDescription" : "",
    		"ItemSpecifics" : "",
    		"ViewItemURL" : item.ListingDetails[0].ViewItemURL[0],
    		"StartTime" : item.ListingDetails[0].StartTime[0],
    		"EndTime" : item.ListingDetails[0].EndTime[0],
    		"PictureURL" : "",
/*    		"test" : 'test " , fdsaf , " fdfs=0-9-0 ' + " \
    		 fdsfsa \n fdsfsd "
*/    	};

		if( "SKU" in item ){
			csvJson["SKU"] = item.SKU[0];
		}
		if( "ConditionID" in item ){
			csvJson["ConditionID"] = item.ConditionID[0];
		}
		if( "ConditionDescription" in item ){
			csvJson["ConditionDescription"] = item.ConditionDescription[0];
		}

    	var itemSpec = "";

    	if( 'ItemSpecifics' in item ){
	    	var itemSpecs = item.ItemSpecifics[0].NameValueList;
	    	//console.log(itemSpecs);
	    	var itemSpecAr = [];
	    	for(var k in itemSpecs){
	    		itemSpecAr.push(itemSpecs[k].Name + "::" + itemSpecs[k].Value);
	    	}    		
	    	itemSpec = itemSpecAr.join("#");
    	}

    	csvJson['ItemSpecifics'] = itemSpec;

    	var picUrls = item.PictureDetails[0].PictureURL;
    	//console.log(picUrls);
    	var picUrl = picUrls.join("|");
    	//console.log(picUrl);

    	csvJson['PictureURL'] = picUrl;

    	//console.log(csvJson);

		json2csv({data: csvJson, fields: ["ItemID","Title","SKU","CategoryID","StartPrice","ConditionID","ConditionDescription","ItemSpecifics","ViewItemURL","StartTime","EndTime","PictureURL"]}, function(err, csv) {
			if (err) console.log(err);
			console.log(csv);
		});
	}
);