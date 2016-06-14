//set up page & svg
var margin = {top: 20, right: 50, bottom: 20, left: 20};

var w = 960 - margin.left - margin.right,
        h = 400 - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
      .attr("width", w + margin.left + margin.right)
      .attr("height", h + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


//create colorMap for color coding shows by state
var colorMap = {"NY": ["#e41a1c", "#980000"], "IN": ["#ffff33","#B3B300"], "MD": ["#4daf4a","#016300"], "TN": ["#984ea3","#4C0257"], "MA": ["#ff7f00", "#B33300"], "IL": ["#377eb8", "#00326C"], "WI": ["#a65628","#5A0A00"], "CA":["#f781bf","#AB3573"], "RI": ["#999999","#4D4D4D"]};



//months array for x axis; years array for y axis
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var years = [2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015];

//ranges of x & y scales are wifth and height of page
var xScale = d3.scale.linear()
     .range([0, w]);

var yScale = d3.time.scale()
     .range([0, h]);

//function for pulling month, date, year out of date
var parseDate = d3.time.format("%m/%d/%Y");

//set up array to calculate even positioning of 12 ticks for 12 months of the year on x axis
var monthTicks = [];
var addthis = 364/12;
var oneMonth = 364/12;
for (var i = 0; i <12; i++) {
    monthTicks.push(oneMonth);
    oneMonth = oneMonth+addthis;
}



//load data, ready function
var data = d3.tsv("updated-show-data.tsv", ready);

function ready(error, data) {
    if (error) return console.warn(error);

    data.forEach(function(d) {
        //find date and year of each show, add this info to data
        d.date = parseDate.parse(d.date);
        d.year = (d.date).getFullYear();
     
        // save year, month, and date as variables
        var yn = (d.date).getFullYear();
        var mn = (d.date).getMonth();
        var dn = (d.date).getDate();
        //determine the distance from each show to Jan 1 of that year. Add this number to the data (for plotting the show)
        var d1 = new Date(yn,0,1,12,0,0); // noon on Jan. 1
        var d2 = new Date(yn,mn,dn,12,0,0); // noon on input date
        var dayNum = Math.round((d2-d1)/864e5);
        d.dayNum = dayNum;

    });  

    //min and max years that could be in the dataset
    minYear = 2002;
    maxYear = 2016;

    //y domain covers every year in the dataset, x domain covers every day in the year, 0-364 (in case of leap year)
    yScale.domain([minYear, maxYear]);
    xScale.domain([0,364]);

    //create tooltip to display show info on hover
    var tooltip = d3.select(".display-band")
        .style("position", "absolute")
        .style("padding", "0 10px")
        .style("background", "white")
        .style("opacity", 0);

    var ticks = [20,40,60,80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340];


    //create the x axis
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .tickValues(monthTicks)
        .tickFormat(function(d,i){ return months[i]; });

    //create the y axis
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(years.length)
        .tickFormat(function(d,i){ return years[i]; });


    //append rects to svg
    svg.append("g")
            .attr("class", "rect-container")
            .selectAll("rect")
            .data(data)
            .enter()
        .append("rect")
            .attr("y", function(d) {
                return yScale(d.year);
            })
            .attr("x", function(d) {
                return xScale(d.dayNum) + margin.left;
            })
            .attr("width", w/405)
            .attr("height", h/(years.length) -2)
            //color based on state
            .attr("fill", function(d) {
                return (colorMap[d.state][0]);
            })
            .attr("Year", function(d) {
                return d.year;
            })
            .attr("City", function(d) {
                return d.City;
            })
            .attr("Date", function(d) {
                return xScale(d.date);
            })
            //display tooltip and darken rect on hover
            .on("mouseover", function(d) {
                tooltip.transition()
                    .style("opacity", .9);
                    tooltip.html("<strong>" + d.venue + " (" + d.city + ") " + parseDate(d.date) + ":</strong> " + d.band);
                d3.select(this)
                    .attr("fill", function(d) {
                        return colorMap[d.state][1];
                    });
            })
            .on("mouseout", function() {
                // tooltip.style("visibility", "hidden");
                d3.select(this)
            .attr("fill", function(d) {
                return colorMap[d.state][0];
            });
            });
    
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + margin.left + "," + h + ")")
        .call(xAxis)
          .selectAll("text")
        .attr("transform", "translate(" + (-w/24) + "," + 0 + ")");

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + margin.left + "," + 0 + ")")
        .call(yAxis)
            .selectAll("text")
        .attr("transform", "translate(" + 0 + "," + (h/(years.length*2)) + ")");










}