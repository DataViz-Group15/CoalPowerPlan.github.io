// --------SLIDER--------------
function update(h) {
  handle.attr("cx", x(h));
  label.attr("x", x(h)).text(formatDate(h));
		
  if(!temp){
	var newStateData = aqi_dataset.filter(function(d) {
	  return d.Year == formatDateIntoYear(h);
	});
	colorState(newStateData);
  } else {
	var newStateData = temp_dataset.filter(function(d) {
	  return d.Year == formatDateIntoYear(h);
	});
	colorState(newStateData);  
  }

  var newData = _(site_data).filter( function(site) {
	return site.commissioning_year < formatDateIntoYear(h);
  })
  displaySites(newData);


}

function colorState(data) { 
   
  d3.json("us.json", function(json) {
      
	svg.selectAll("path")
    .data(json.features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("stroke", "#fff")
    .style("stroke-width", "1")
    .style("fill", "#bbb")
 });   
  svg.selectAll("path")
    .data(data)
    .style("fill", function(d) {
        if(!temp) {
          var days = Number(d.Days);
          var good =Number(d.Good);
          var moderate =Number(d.Moderate);
          var unhealthyForS = Number(d.UnhealthyForS);
          var unhealthy =Number(d.Unhealthy);
          var veryUnhealthy =Number(d.VeryUnhealthy);
          var hazardous =Number(d.Hazardous);

          var sum = good + moderate * 2 + unhealthyForS*3 + unhealthy*4 + veryUnhealthy*5 + hazardous*6;
          var avg =sum/days;
          if(days){
            return  color(avg);
          }else{
            return "#bbb";
          }
        } else {
          var avg = Number(d.avg)
          return colorTemp(avg)
        }
});
   if(!temp){
     let tmp2 = ["rgb(72,197,85)", "rgb(106,142,51)",
            "rgb(171,169,73)", "rgb(196,129,58)", "rgb(209,24,0)","rgb(101,41,43)"]
var legend = d3.select("body").append("svg")
      			.attr("class", "legend")
     			.attr("width", 140)
    			.attr("height", 200)
   				.selectAll("g")
   				.data(tmp2)
   				.enter()
   				.append("g")
     			.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
     
  	legend.append("rect")
   		  .attr("width", 18)
   		  .attr("height", 18)
   		  .style("fill", function(d) {return d});

  	legend.append("text")
  		  .data(legendText)
      	  .attr("x", 24)
      	  .attr("y", 9)
      	  .attr("dy", ".35em")
      	  .text(function(d) { return d; });
   }
 
}


//----------BUTTON---------------
function switch_mode(h) {
  if(!temp){
	var newStateData = aqi_dataset.filter(function(d) {
	  return d.Year == formatDateIntoYear(h);
	});
	colorState(newStateData);
  } else {
	var newStateData = temp_dataset.filter(function(d) {
	  return d.Year == formatDateIntoYear(h);
	});
	colorState(newStateData);  
  }
}

// update button color when clicked
function updateButtonColors(button, parent) {
  parent.selectAll("rect")
    .attr("fill",defaultColor)

  button.select("rect")
    .attr("fill",pressedColor)
}
  
function buttonClicked(type) {
  updateButtonColors(d3.select(this), d3.select(this.parentNode))
  if (type == "Temp"){
    temp = true
    //colorState(temp_dataset)
    switch_mode(x.invert(handle.attr("cx")))
    console.log("HHHHH111", handle.attr("cx"))
  }
  
  if (type == "Air") {
    temp = false
    //colorState(aqi_dataset)
    switch_mode(x.invert(handle.attr("cx")))
    console.log("HHHHH",handle)
  }
}