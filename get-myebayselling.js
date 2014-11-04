var ebayTradingAPI = require('../node-ebay-trading-api');
require('date-utils');
var fs = require('fs');


var config = require('./config.json');

ebayTradingAPI.setUserToken(config.eBayAuthToken);

ebayTradingAPI.debug(true);

var listType = process.argv[2];
console.warn('list type:' + listType);

if( ! listType ){
	console.log("Please pass list type [ActiveList SoldList UnsoldList] !!");
	process.exit(9);
}

var pageNumber = 1;
if( process.argv[3] ){
	pageNumber = process.argv[3];
}

var reqArgs = {
	"DetailLevel" : "ReturnAll",
};

reqArgs[listType] = {
	"Pagination" : {
		"EntriesPerPage": 200,
		"PageNumber" : pageNumber
	}
}

ebayTradingAPI.call(
	"GetMyeBaySelling",
	reqArgs,
	function(result){
		console.log(result.GetMyeBaySellingResponse);
		console.log("Errors:" + result.GetMyeBaySellingResponse.Errors);
		
		if( listType in result.GetMyeBaySellingResponse ){
			var list = result.GetMyeBaySellingResponse[listType][0].ItemArray[0].Item;
			var pagination = result.GetMyeBaySellingResponse[listType][0].PaginationResult;

			console.log(list);
			console.log(pagination);

			var dt = new Date();

			var saveFile = "Out" + listType + dt.toFormat("YYYYMMDDHH24MISS") + ".json";

			fs.writeFileSync(saveFile, JSON.stringify(list));

			console.log("Saved to " + saveFile);
		}
		else{
			console.error("There is no result for : " + listType);
		}
	}
);