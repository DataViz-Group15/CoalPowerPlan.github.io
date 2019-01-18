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
  draw(newData);
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

    var legend = d3.select("body").append("svg").attr("class", "legend")
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
  if (type == "Temp") {
    temp = true
    switch_mode(x.invert(handle.attr("cx")))
  }
  
  if (type == "Air") {
    temp = false
    switch_mode(x.invert(handle.attr("cx")))
  }
}

// DRAWING RANKING CHART
function draw(df) {
  df.sort(function(a, b) {
    return -(a.cap - b.cap);
  });
  df = df.slice(0,10)

  x1.domain(df.map(function (d) { return d.name; }));
  y1.domain([0, d3.max(df, function (d) {
    return d.cap; })]);
  var bounds = svgF.node().getBoundingClientRect(),
      width1 = bounds.width - margin.left - margin.right,
      height1 = bounds.height - margin.top - margin.bottom;

  x1.rangeRound([0, width1/1.5]);
  y1.rangeRound([height1, 0]);

  gF.select(".axis--x")
    .attr("transform", "translate(0," + height1  + ")")
    .call(d3.axisBottom(x1))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-0.96em")
    .attr("dy", "-2.5em")
    .attr("transform", "rotate(-60)" );

  gF.select(".axis--y")
    .call(d3.axisLeft(y1).ticks(10));

  var lf = gF.selectAll(".labelF");	
  var bars = gF.selectAll(".bar");
  // ENTER
  temp1 = bars.data(df);
  temp2 = lf.data(df);
  if (lf.empty()) {

    temp1
      .enter().append("rect")
      .attr("class", "bar")
      .transition()
      .delay(function(p, i) { return i*100 })
      .duration(500)

    temp2
      .enter().append("text")
      .attr("class","labelF")
  }

  temp1.attr("x", function (d) { return x1(d.name); })
    .attr("y", function (d) { return y1(d.cap); })
    .attr("width", x1.bandwidth())
    .attr("height", function (d) { return height1 - y1(d.cap); })
    .on('mouseover', function(d) {
    var pl;
    var t = d3.selectAll('.site')._groups[0]
    for(let i = 0; i < t.length; i++){
      if(t[i].__data__.name === d.name) {
        pl = t[i] // co the truy cap cx, cy
        break;
      }
    }
    d3.selectAll('.site')
      .filter(function(e) {
      if(e.name !== d.name){
        return e
      }
    })
      .style('opacity', .09)
    var mouse = d3.mouse(svg.node()).map(function(x) {
      return parseInt(x)
    })
    tooltip.classed("hidden", false)
      .attr("style", "left:" + (pl.cx.baseVal.value + ml)*0.45 +
            "px; top:" + (pl.cy.baseVal.value + mt)*0.75 + "px")
      .html(d.name + ": " + d.cap + "mW in " + d.commissioning_year)
  })
    .on('mouseout', function(d) {
    tooltip.classed("hidden", true)
    d3.selectAll('.site')
      .filter(function(e) {
      return e.name !== d.nmae
    })
      .style('opacity', 1)  
  });

  temp2.attr("x", (function(d) { return x1(d.name)+30; }  ))
    .attr("y", function(d) { return y1(d.cap) -15; })
    .attr("dy", ".75em")
    .text(function(d) { return parseInt(d.cap); });
}