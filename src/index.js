import * as d3 from 'd3';
import $ from 'jquery';
import 'bootstrap';

//import "css/bootstrap.min.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'webpack-icons-installer/bootstrap';
import './css/style.css';
import * as page from './page';
 

$(window).on("load", () => {

    // We are setting up the page layout here.
    page.addNavbar();
     //creating margin
  var margin ={left:100, right:100, top:10, bottom:100};
  var width = 600 - margin.left - margin.right;
  var height = 500 -margin.top - margin.bottom;
  
  //setting Flag variable to flick data
  var flag = true;
  
  //adding transition variable
  var t = d3.transition().duration(750);
  
     //SVG Canvas
  var svg = d3.select("#chart-area")
      .append("svg")
      .attr("height",height + margin.top + margin.bottom)
      .attr("width",width +margin.left + margin.right); 

  var g = svg.append("g")
              .attr("transform","translate(" + margin.left + "," + margin.top + ")" );
  
   // X-label
   g.append("text") 
    .attr("class", "x axis-label")
    .attr("x", width/2)          
    .attr("y",height + 80)
    .attr("font-size", "20px")
    .attr("text-anchor","middle")
    .text("Months");

  //y-label
  var yLabel = g.append("text")
    .attr("class","y axis-label")
    .attr("x",- (height/2))
    .attr("y", -75)
    .attr("fornt-size","20px")
    .attr("text-anchor","middle")
    .attr("transform","rotate(-90)")
    .text("Revenue")  

            //y-scale 
      var y = d3.scaleLinear()
            .range([height,0]);
            
      var yAxisGroup =  g.append("g")
            .attr("class", "y axis");
             

      //x-scale
      var x = d3.scaleBand()
              .range([0,width])
              .paddingInner(0.1)
              .paddingOuter(0.2);

       var xAxisGroup = g.append("g")
              .attr("class","x axis")
              .attr("transform","translate(0,"+height+")");
              

              // get revenue data from json file            
 d3.json("data/revenues.json").then(function(data){
    data.forEach((d)=>{
       d.revenue = +d.revenue;
       d.profit = +d.profit;     
    });

    //console.log(data);


    d3.interval(function(){
      update(data)
      flag = !flag
    },1000) ;

    //Run the visualization first time
    update(data);
           
                
  });// end of data window
 

                     
function update(data){
          var value = flag ? "revenue" : "profit";
          
          y.domain([0,d3.max(data,(d)=>{return d[value];})])
          x.domain(data.map((d)=>{return d.month;}))

            var xAxisCall = d3.axisBottom(x);
              xAxisGroup.transition(t).call(xAxisCall); 
              
      
        var yAxisCall = d3.axisLeft(y)
                          .tickFormat((d)=>{return  "$" + d;});

              yAxisGroup.transition(t).call(yAxisCall);            

              
              // JOIN new data with old elements
var rectangle = g.selectAll("rect")
           .data(data);
          
           // EXIT old elements not present in new data
          rectangle.exit()
                   .attr("fill","red")
                   .transition(t)
                   .attr("y",y(0))
                   .attr("height",0)
                   .remove();

          // UPDATE old elements present in new data
           rectangle.transition(t)
           .attr("x",(d)=>{return x(d.month);})
           .attr("y",(d)=>{return y(d[value]);})
           .attr("width",x.bandwidth)
           .attr("height",(d)=>{return height - y(d[value]);})
           .attr("fill","steelblue")
           .attr("stroke","green")
           .attr("stroke-width","1px");  
           
           //ENTER new elements present in new data
           rectangle.enter()
           .append("rect")
           .attr("x",(d)=>{return x(d.month);})
           .attr("y",y(0))
           .attr("width",x.bandwidth)
           .attr("height",0)
           .attr("fill","steelblue")
           .attr("stroke","green")
           .attr("stroke-width","1px")
           .transition(t)
           .attr("y",(d)=>{return y(d[value]);})
           .attr("height",(d)=>{return height - y(d[value]);})
           ; 
           
           //console.log(rectangle);
           var label = flag ? "Revenue" : "Profit";
           yLabel.text(label);
}
});