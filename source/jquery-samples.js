// jQuery samples
systemId = "a75ee8ce-3b8f-4ec6-99bc-2b7530303cf9";
channelId = "3de19ec6-1e66-4534-bb55-b6a49e6c2771";

// Sample for Search
var searchString = $("#search").val();
$.ajax({
	type: 'get',
	url: "https://services.int1.cdops.net/Subscriber/SearchProducts/systemId/" + systemId + "/SearchString/" + searchString,
	dataType: 'json',
	success: function(data){
		jsonData = data;
		$.each(data.Products, function(i,Product) {
			// Output item sample.
			$(".results").append("<li><a href='#'" + Product.Id + "'>" + Product.Name + "</a></li>");
		});					
	}
});