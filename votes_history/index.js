Promise.all([d3.csv("1976-2020-president.csv"),d3.csv("election by state - 2024.csv")])
.then(function(d){


    var state2024 = d[1]
    var formattedState2024 = getDif2024(state2024)
    var national2024 = {year:2024,d:74459177,r:76938892,total:154905224}
    var nationalMargin2024 = (national2024.d-national2024.r)/national2024.total*100
    national2024["dMinusR"]=nationalMargin2024
   // console.log(formattedState2024)
    var stateData = d[0]

    var nationalData = tallyNational(stateData)
    nationalData.push(national2024)
   // console.log(nationalData)
    var countyDif = formatByState(stateData)
    var sample1 = ["AZ", "GA", "NC", "WI", "MI", "NV", "PA"]
    var sample2 = ["AZ", "GA", "NC", "WI", "MI", "NV", "PA","CO", "FL", "IA", "IN", "OH", "VA"]
    drawChart(sample1,countyDif,nationalData,"sample1Chart1",formattedState2024)
    drawChart(sample2,countyDif,nationalData,"sample2Chart1",formattedState2024)

    drawNationalComparisonChart(sample1,countyDif,nationalData,"sample1Chart2",formattedState2024)
    drawNationalComparisonChart(sample2,countyDif,nationalData,"sample2Chart2",formattedState2024)

})

function getDif2024(data){
    var formatted = {}
for(var s in data){
    var state = data[s].state
    var d = parseInt(data[s].democrat)
    var r = parseInt(data[s].republican)
    var all = parseInt(data[s].total)

    var dif = (d-r)/all
    formatted[state]=dif*100
    }
    return formatted
}
var years = [2004,2008,2012,2016,2020]

function drawNationalComparisonChart(statesToInclude,countyDif,nationalData,divName,formattedState2024){
    var nationalDictionary = {}
    for(var n in nationalData){
        nationalDictionary[nationalData[n].year]=nationalData[n].dMinusR
    }
    var w = 600
    var p = 40
    var h = 400
    var popup = d3.select("#"+divName).append("div")
    .attr("class","subtitle")
    .html("State Vote Margin Difference - National Vote Margin Difference<br> States: "+statesToInclude.join(","))
   // var popup = d3.select("#"+divName).append("div").html("rollover to see data").attr('id',divName+"title")

    var svg = d3.select("#"+divName).append("svg").attr("width",w).attr("height",h)

    var xScale = d3.scaleLinear().domain([-30,30]).range([w-p*2,0])
    var yScale = d3.scaleLinear().domain([2004,2024]).range([0,h-p*2])
    var widthScale = d3.scaleLinear().domain([0,5000000]).range([3,10])
    var xAxis = d3.axisTop().scale(xScale).ticks(5)
    .tickFormat(function(d){

        if(d<0){
            return "+"+Math.abs(d)
        }else if(d>0){
            return "+"+Math.abs(d)
        }else{
            return "EVEN"
        }
    }
       ).tickSize(h-p*1.8)
    svg.append("g").call(xAxis).attr("transform","translate("+p+","+(h-p)+")")//.attr("stroke-width","1")
    .attr("opacity",".3")

    var yAxis = d3.axisLeft().scale(yScale).tickValues([2004,2008,2012,2016,2020,2024]).tickFormat(function(d){return String(d)}).tickSize(w-p*2)
    svg.append("g").call(yAxis).attr("transform","translate("+(w-p)+","+p+")").attr("stroke-width","1")
    .attr("opacity",".3")
    var cScale = d3.scaleLinear().domain([-10,0,10]).range(["red","gray","blue"])
    var lines = svg.append("g").attr("transform","translate("+p+","+p+")")
   
    
    lines.append("path")
    .attr('stroke',"black")
    .attr('fill',"none")
    .attr("opacity",1)
    .attr("stroke-width",2)
    .attr("d",
        d3.line().curve(d3.curveBumpY)
        .x(function(d){return xScale(d.dMinusR-nationalDictionary[d.year])})
        .y(function(d,i){return yScale(d.year)})
        (nationalData)
    )


    for(var c in countyDif){
        var state = countyDif[c][0].state
        if(statesToInclude.indexOf(state)>-1){
            var with2024 = countyDif[c].concat({year:2024,state:countyDif[c][0].state,dMinusR:formattedState2024[countyDif[c][0].state]})
            // console.log(state)
            // console.log(xScale(countyDif[c][0].dMinusR))

            lines.append("path")
            .attr("total",countyDif[c][0].sum)
            .attr("state",state)
            .attr("fips",c)
            .attr('stroke',cScale(countyDif[c][0].dMinusR))
            .attr('fill',"none")
            .attr("stroke-width",widthScale(countyDif[c][0].sum))
            .attr("opacity",.2)
            .attr("class","lines")
            .attr("d",
                d3.line().curve(d3.curveBumpY)
                .x(function(d){
                    return xScale(d.dMinusR-nationalDictionary[d.year])})
                .y(function(d,i){return yScale(d.year)})
                (with2024)
            )
            .on("mouseover",function(e,d){
                var currentState = d3.select(this).attr('state')
                var dMinusR = formattedState2024[currentState]
                d3.select(this).attr("opacity",.5)
                d3.select("#"+divName+"title").html(d3.select(this).attr("state")+", total votes: "+d3.select(this).attr("total"))
                
                lines.append("text")
                .text(currentState)
                .attr("y",h-p*1.5)
                .attr("x",xScale(dMinusR-nationalDictionary["2024"]))
                .attr("class","stateLabels")

                lines.append("text")
                .attr("class","yearLabels2024")
                .text(function(){
                    if(dMinusR<1){
                        return "+"+Math.round(Math.abs(dMinusR-nationalDictionary["2024"])*10)/10+" R"
                    }
                    return "+"+Math.round(Math.abs(dMinusR-nationalDictionary["2024"])*10)/10+ "D"
                }
                )
                .attr("x",xScale(dMinusR-nationalDictionary["2024"]))
                .attr("y",yScale(2024)+4)

                lines.selectAll(".yearLabels")
                .data(countyDif[d3.select(this).attr("fips")])
                .enter()
                .append("text")
                .attr("class","yearLabels")
                .attr("fill",function(d){return cScale(d.dMinusR)})
                .attr("x",function(d){return xScale(d.dMinusR-nationalDictionary[d.year])+4})
                .attr("y",function(d,i){return yScale(d.year)+4})
                .text(function(d){
                    if(d.dMinusR<1){
                        return "+"+Math.round(Math.abs(d.dMinusR-nationalDictionary[d.year])*10)/10+" R"
                    }
                    return "+"+Math.round(Math.abs(d.dMinusR-nationalDictionary[d.year])*10)/10+ "D"
                })
            })
            .on("mouseout",function(e,d){
                d3.selectAll(".stateLabels").remove()
                d3.selectAll(".yearLabels").remove()
                d3.selectAll(".yearLabels2024").remove()
                d3.select(this).attr("opacity",.2)
                d3.select("#"+divName+"title").html("rollover to see data")

                
            })
    }
    }
}

function drawChart(statesToInclude,countyDif,nationalData,divName,formattedState2024){
    var nationalDictionary = {}
    for(var n in nationalData){
        nationalDictionary[nationalData[n].year]=nationalData[n].dMinusR
    }
     var w = 600
    var p = 40
    var h = 400
    var popup = d3.select("#"+divName).append("div").attr("class","subtitle").html("<br>Rep-Dem/Total Votes<br>states:"+statesToInclude.join(","))
  //  var popup = d3.select("#"+divName).append("div").html("rollover to see data").attr('id',divName+"title")

    var svg = d3.select("#"+divName).append("svg").attr("width",w).attr("height",h)

    var xScale = d3.scaleLinear().domain([-40,40]).range([w-p*2,0])
    var yScale = d3.scaleLinear().domain([2004,2024]).range([0,h-p*2])
    var widthScale = d3.scaleLinear().domain([0,5000000]).range([3,10])



    var xAxis = d3.axisTop().scale(xScale).ticks(3)
    .tickFormat(function(d){

        if(d<0){
            return "+"+Math.abs(d)
        }else if(d>0){
            return "+"+Math.abs(d)
        }else{
            return "EVEN"
        }
    }
       )
        .tickSize(h-p*1.8)
    svg.append("g").call(xAxis).attr("transform","translate("+p+","+(h-p)+")")//.attr("stroke-width","1")
    .attr("opacity",".3")

    var yAxis = d3.axisLeft().scale(yScale).tickValues([2004,2008,2012,2016,2020,2024]).tickFormat(function(d){return String(d)}).tickSize(w-p*2)
    svg.append("g").call(yAxis).attr("transform","translate("+(w-p)+","+p+")").attr("stroke-width","1")
    .attr("opacity",".3")
    var cScale = d3.scaleLinear().domain([-10,0,10]).range(["red","gray","blue"])
    var lines = svg.append("g").attr("transform","translate("+p+","+p+")")

    lines.append("path")
    .attr('stroke',"black")
    .attr('fill',"none")
    .attr("opacity",1)
    .attr("stroke-width",2)
    .attr("d",
        d3.line().curve(d3.curveBumpY)
        .x(function(d){return xScale(d.dMinusR)})
        .y(function(d,i){return yScale(d.year)})
        (nationalData)
    )
    lines.append("text").text("National")
    .attr("x",xScale(nationalData[0].dMinusR)+5).attr("y",-10)
    //.attr("text-anchor","middle")
    lines.selectAll(".dots")
        .data(nationalData)
        .enter()
        .append("circle")
        .attr("cx",function(d){return xScale(d.dMinusR)})
        .attr("cy",function(d,i){return yScale(d.year)})
        .attr("r",3)

    lines.selectAll(".dots")
        .data(nationalData)
        .enter()
        .append("text")
        .attr("x",function(d){return xScale(d.dMinusR)+4})
        .attr("y",function(d,i){return yScale(d.year)+4})
        .text(function(d){return "+"+Math.abs(Math.round(d.dMinusR))})

       
    for(var c in countyDif){
        var state = countyDif[c][0].state
        if(statesToInclude.indexOf(state)>-1){

            var with2024 = countyDif[c].concat({year:2024,state:countyDif[c][0].state,dMinusR:formattedState2024[countyDif[c][0].state]})
           // console.log(with2024)
            lines.append("path")
            .attr("total",countyDif[c][0].sum)
            .attr("state",countyDif[c][0].state)
            .attr("fips",c)
            //.attr("stroke","#000")
            .attr('stroke',cScale(countyDif[c][0].dMinusR))
            .attr('fill',"none")
            .attr("stroke-width",widthScale(countyDif[c][0].sum))
            .attr("opacity",.2)
                .attr("class","lines")
                .attr("d",
                    d3.line().curve(d3.curveBumpY)
                    .x(function(d){return xScale(d.dMinusR)})
                    .y(function(d,i){return yScale(d.year)})
                    (with2024)
            )
            .on("mouseover",function(e,d){
                var currentState = d3.select(this).attr('state')
                var dMinusR = formattedState2024[currentState]
                d3.select(this).attr("opacity",.5)
                d3.select("#"+divName+"title").html(d3.select(this).attr("state")+", total votes: "+d3.select(this).attr("total"))

                lines.append("text")
                .text(currentState)
                .attr("y",h-p*1.5)
                .attr("x",xScale(dMinusR-nationalDictionary["2024"]))
                .attr("class","stateLabels")

                lines.append("text")
                .attr("class","yearLabels2024")
                .text(function(){
                    if(dMinusR<1){
                        return "+"+Math.round(Math.abs(dMinusR-nationalDictionary["2024"])*10)/10+" R"
                    }
                    return "+"+Math.round(Math.abs(dMinusR-nationalDictionary["2024"])*10)/10+ "D"
                }
                )
                .attr("x",xScale(dMinusR-nationalDictionary["2024"]))
                .attr("y",yScale(2024)+4)

                lines.selectAll(".yearLabels")
                .data(countyDif[d3.select(this).attr("fips")])
                .enter()
                .append("text")
                .attr("class","yearLabels")
                .attr("fill",function(d){return cScale(d.dMinusR)})
                .attr("x",function(d){return xScale(d.dMinusR)+4})
                .attr("y",function(d,i){return yScale(d.year)+10})
                .text(function(d){
                    if(d.dMinusR<1){
                        return "+"+Math.round(Math.abs(d.dMinusR)*10)/10+" R"
                    }
                    return "+"+Math.round(Math.abs(d.dMinusR)*10)/10+ "D"
                })
            })
            .on("mouseout",function(e,d){
                d3.selectAll(".stateLabels").remove()
                d3.selectAll(".yearLabels2024").remove()
                d3.selectAll(".yearLabels").remove()
                d3.select(this).attr("opacity",.2)
                d3.select("#"+divName+"title").html("rollover to see data")

                
            })
    }
        
    }

}
function tallyNational(data){
    var national ={"DEMOCRAT":{},"REPUBLICAN":{},"TOTALS":{}}
    for(var i in data){
     year = data[i].year
     party = data[i]["party_simplified"]
     count = parseInt(data[i]["candidatevotes"])

    if(Object.keys(national["TOTALS"]).indexOf(year)>-1){
        national["TOTALS"][year]+=count
    }else{
        national["TOTALS"][year]=count
    }
     if(party =="DEMOCRAT"){
        if(Object.keys(national["DEMOCRAT"]).indexOf(year)>-1){
            national["DEMOCRAT"][year]+=count
        }else{
            national["DEMOCRAT"][year]=count

        }
     }
     if(party =="REPUBLICAN"){
        if(Object.keys(national["REPUBLICAN"]).indexOf(year)>-1){
            national["REPUBLICAN"][year]+=count
        }else{
            national["REPUBLICAN"][year]=count

        }
     }
    }

    var differences = []

    for(var y in years){
        var year = years[y]
        var d = national["DEMOCRAT"][year]
        var r = national["REPUBLICAN"][year]
        var all = national["TOTALS"][year]
        var difference = (d-r)/all*100
        differences.push({year:year,dMinusR:difference, all:all,d:d,r:r})
    }
    return differences
}

function formatByState(data){
    var formatted = {}
    for(var i in data){
        var fips = String(data[i]["state_fips"])
        var state = data[i]["state_po"]
        var year = data[i]["year"]
        var votes = parseInt(data[i]["candidatevotes"])
        var total = parseInt(data[i]["totalvotes"])
        var party = data[i]["party_simplified"]

        if(fips !="undefined" &&fips != "NA"){
            if(Object.keys(formatted).indexOf(fips)>-1){
                if(Object.keys(formatted[fips]).indexOf(party)>-1){
                    if(Object.keys(formatted[fips][party]).indexOf(year)>-1){
                        formatted[fips][party][year]+=votes
                    }else{
                        formatted[fips][party][year]=votes
                    }
                }else{
                    formatted[fips][party]={}
                    formatted[fips][party][year]=votes
                }
            }else{
                formatted[fips]={}
                formatted[fips]["state"]=state
                formatted[fips][party]={}
                formatted[fips][party][year]=votes
            }
        }       
    }

var difference = {}

for(var f in formatted){
        difference[f] = []
    years.forEach(function(d){

        if(formatted[f]["DEMOCRAT"]!=undefined){
            var dVotes = parseInt(formatted[f]["DEMOCRAT"][d])
            var rVotes = parseInt(formatted[f]["REPUBLICAN"][d])
            var total = dVotes+rVotes
            var dMinusR = (dVotes-rVotes)/(total)*100

            difference[f].push({year:d,dMinusR:dMinusR,sum:total,state:formatted[f]["state"]})
        }
    
    })
}
    return difference
}