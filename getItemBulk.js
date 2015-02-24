var xml2js = require('xml2js');
var fs = require('fs');
var json2csv = require('json2csv');
var util = require("util");
var ebayTradingAPI = require('node-ebay-trading-api');


var config = require('./config.json');

ebayTradingAPI.setUserToken(config.eBayAuthToken);

//console.log(ebayTradingAPI.getUserToken());

var inputFile = process.argv[2];
console.warn('input file:' + inputFile);

if (!fs.existsSync(inputFile)) {
    console.log("Please pass valid input file path!!");
    process.exit(9);
}

var itemIDLines = fs.readFileSync(inputFile).toString();
var itemIDs = itemIDLines.split("\n");
//console.log(itemIDs);

for(var i in itemIDs){
    var itemID = itemIDs[i];
    getItem(itemID);
}


function getItem(itemID) {
    ebayTradingAPI.call(
        "GetItem", {
            "ItemID": itemID,
            "DetailLevel": "ReturnAll",
            "IncludeItemSpecifics": 1
        },
        function(result) {
            //console.log(result.GetItemResponse.Errors);

            var item = result.GetItemResponse.Item[0];
            //console.log(item);

            // ItemID,Title,SKU,CategoryID,StartPrice,ConditionID,ConditionDescription,ItemSpecifics,ViewItemURL,StartTime,EndTime,PictureURL
            var outObj = {
                "ItemID": item.ItemID[0],
                "Title": item.Title[0],
                "SKU": '',
                "CategoryID": item.PrimaryCategory[0].CategoryID[0],
                "StartPrice": item.StartPrice[0]['_'],
                "ConditionID": "",
                "ConditionDescription": "",
                "ItemSpecifics": {},
                "ViewItemURL": item.ListingDetails[0].ViewItemURL[0],
                "StartTime": item.ListingDetails[0].StartTime[0],
                "EndTime": item.ListingDetails[0].EndTime[0],
                "PictureURL": "",
                "Description": item.Description[0],
                "UPC" : "",
                "Manufacturer" : "",
                "MPN" : "",
                "Model" : "",
                /*    		"test" : 'test " , fdsaf , " fdfs=0-9-0 ' + " \
                    		 fdsfsa \n fdsfsd "
                */
            };

            if ("SKU" in item) {
                outObj["SKU"] = item.SKU[0];
            }
            if ("ConditionID" in item) {
                outObj["ConditionID"] = item.ConditionID[0];
            }
            if ("ConditionDescription" in item) {
                outObj["ConditionDescription"] = item.ConditionDescription[0];
            }

            if ('ItemSpecifics' in item) {
                var itemSpecs = item.ItemSpecifics[0].NameValueList;
                //console.log(itemSpecs);
                for (var k in itemSpecs) {
                    outObj.ItemSpecifics[itemSpecs[k].Name] = itemSpecs[k].Value[0];

                    if( itemSpecs[k].Name[0] == "Model" ){
                        outObj.Model = itemSpecs[k].Value[0];
                    }
                    if( itemSpecs[k].Name[0] == "MPN" ){
                        outObj.MPN = itemSpecs[k].Value[0];
                    }
                }
            }

            var picUrls = item.PictureDetails[0].PictureURL;
            //console.log(picUrls);
            var picUrl = picUrls.join("|");
            //console.log(picUrl);

            outObj['PictureURL'] = picUrl;

            //console.log(outObj);

            if( "ProductListingDetails" in item ){
                if("UPC" in item.ProductListingDetails[0]){
                    outObj.UPC = item.ProductListingDetails[0].UPC[0];
                }
                if("BrandMPN" in item.ProductListingDetails[0]){
                    if( "Brand" in item.ProductListingDetails[0].BrandMPN[0] ){
                       outObj.Manufacturer = item.ProductListingDetails[0].BrandMPN[0].Brand[0];    
                    }
                    if( "MPN" in item.ProductListingDetails[0].BrandMPN[0] ){
                       outObj.MPN = item.ProductListingDetails[0].BrandMPN[0].MPN[0];    
                    }
                }
            }

            var dispObj = {
                "UPC" : outObj.UPC,
                "Title" : outObj.Title,
                "Manufacturer" : outObj.Manufacturer,
                "MPN" : outObj.MPN,
                "Model" : outObj.Model,
                //"ItemSpecifics" : outObj.ItemSpecifics,
            }
            if( dispObj.UPC ){
                console.log('"' + dispObj.UPC + '", "' + dispObj.Title + '", "' + dispObj.Manufacturer + '", "' + dispObj.MPN + '", "' + dispObj.Model + '"');
            }
        }
    );
}
