var json2csv = require('json2csv');
var util = require("util");


var inputJson = process.argv[2];
console.warn('input json:' + inputJson);

if( ! inputJson ){
	console.log("Please pass input json file path !!");
	process.exit(9);
}

var json = require(inputJson);

for(var i in json){
	var item = json[i];

	inspect(item);

	// ItemID,Title,SKU,CategoryID,Price,ConditionID,ConditionDescription,ItemSpecifics,ViewItemURL,StartTime,EndTime,PictureURL
	var csvJson = {
		"ItemID" : item.ItemID[0],
		"Title" : item.Title[0],
		"SKU" : '',
		"CategoryID" : '',	//item.PrimaryCategory[0].CategoryID[0],
		"Price" : 0,	//item.StartPrice[0]['_'],
		"ConditionID" : "",
		"ConditionDescription" : "",
		"ItemSpecifics" : "",
		"ViewItemURL" : item.ListingDetails[0].ViewItemURL[0],
		"StartTime" : item.ListingDetails[0].StartTime[0],
		"EndTime" : '',
		"PictureURL" : "",
/*    		"test" : 'test " , fdsaf , " fdfs=0-9-0 ' + " \
		 fdsfsa \n fdsfsd "
*/    	};

	if( "SKU" in item ){
		csvJson["SKU"] = item.SKU[0];
	}
	if( "PrimaryCategory" in item ){
		csvJson["CategoryID"] = item.PrimaryCategory[0].CategoryID[0];
	}
	if( "StartPrice" in item ){
		csvJson["Price"] = item.StartPrice[0]['_'];
	}
	if( "BuyItNowPrice" in item ){
		csvJson["Price"] = item.BuyItNowPrice[0]['_'];
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

	if( "EndTime" in item.ListingDetails[0] ){
		csvJson["EndTime"] = item.ListingDetails[0].EndTime[0];
	}

	var picUrls = item.PictureDetails[0].PictureURL || [];
	//console.log(picUrls);
	var picUrl = picUrls.join("|");
	//console.log(picUrl);

	csvJson['PictureURL'] = picUrl;
}

json2csv({data: csvJson, fields: ["ItemID","Title","SKU","CategoryID", "Price","ConditionID","ItemSpecifics","ViewItemURL","StartTime","EndTime","PictureURL"]}, function(err, csv) {
	if (err) console.log(err);
	console.log(csv);
});




function inspect(value)
{
    console.log(util.inspect(value, false, null));
}
