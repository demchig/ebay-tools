var fs = require('fs');
var ebayTradingAPI = require('node-ebay-trading-api');


var config = require('./config.json');

ebayTradingAPI.setUserToken(config.eBayAuthToken);

//console.log(ebayTradingAPI.getUserToken());

var categoriID = process.argv[2];
console.warn('category id:' + categoriID);

if( ! categoriID ){
	console.log("Please pass category id!!");
	process.exit(9);
}

ebayTradingAPI.call(
	"GetCategorySpecifics",
	{
		"CategoryID" : categoriID
	},
	function(result){
		if( "Errors"  in result.GetCategorySpecificsResponse){
			console.log(result.GetCategorySpecificsResponse.Errors);
		}

		var Recommendations = result.GetCategorySpecificsResponse.Recommendations[0] || [];
		//console.log(Recommendations);

		if( "NameRecommendation" in Recommendations ){
			var NameRecommendations = Recommendations.NameRecommendation;

			for(var i in NameRecommendations ){
				var recommendation = NameRecommendations[i];
				//console.log(recommendation);
				var Name = recommendation.Name[0];
				var ValidationRule = recommendation.ValidationRules[0];
				var ValueRecommendations = recommendation.ValueRecommendation;

				console.log(Name);
				console.log(ValidationRule);
			}
			
		}

/*		var savePath = "./data/category" + csvJson.categoriID + ".json";

		fs.writeFileSync(savePath, JSON.stringify(csvJson));
		console.log("Saved to " + savePath);
*/

	}
);