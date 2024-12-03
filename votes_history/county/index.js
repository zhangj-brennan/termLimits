Promise.all([d3.csv("countypres_2000-2020.csv")])
.then(function(d){
    console.log(d)
    var countyData = d[0]
    var countyDif = formatByCounty(countyData)
console.log(Object.values(countyDif))

    var svg = d3.select("#container").append("svg").attr("width",1000).attr("height",800)

var temp = [3,4,5,3,6,7]


var xScale = d3.scaleLinear().domain([-100,100]).range([1000,0])
var yScale = d3.scaleLinear().domain([2000,2020]).range([0,500])
var widthScale = d3.scaleLinear().domain([0,200000]).range([0,10])
for(var c in countyDif){
        svg.append("path")
        .attr("total",countyDif[c][0].sum)
        .attr("name",countyDif[c][0].name)
        .attr("state",countyDif[c][0].state)
        .attr("countyFips",c)
        .attr('stroke',"black")
        .attr('fill',"none")
        .attr("stroke-width",widthScale(countyDif[c][0].sum))
        .attr("opacity",.1)
            .attr("class","lines")
            .attr("d",
                d3.line().curve(d3.curveBasis)
                .x(function(d){return xScale(d.dMinusR)})
                .y(function(d,i){return yScale(d.year)})
                (countyDif[c])
        )
        .on("mouseover",function(e,d){
            d3.select(this).attr("stroke","red")
            d3.select("#label").html(d3.select(this).attr("name")+" "+d3.select(this).attr("state")+" "+d3.select(this).attr("total"))
            console.log(d3.select(this).attr("data"))

            svg.selectAll(".yearLabels")
            .data(countyDif[d3.select(this).attr("countyFips")])
            .enter()
            .append("text")
            .attr("class","yearLabels")
            .attr("x",function(d){return xScale(d.dMinusR)+10})
            .attr("y",function(d,i){return yScale(d.year)})
            .text(function(d){return d.dMinusR})
        })
        .on("mouseout",function(e,d){
            d3.selectAll(".yearLabels").remove()
            d3.select(this).attr("stroke","black")
             
        })
}


//     svg.selectAll('.lines')
//     .data(Object.values(countyDif))
//     .enter()
//     .append("path")
//     .attr("class","lines")
//     .attr("d",
//         d3.line()
//         .y(function(d){console.log(d); return d.year})
//         .x(function(d){return d.dMinusR})
//         (d.values)
// )
})


function formatByCounty(countyData){
    var formatted = {}

    for(var i in countyData){
        var countyFips = String(countyData[i]["county_fips"])
        var state = countyData[i]["state"]
        var year = countyData[i]["year"]
        var candidate = countyData[i]["candidate"]
        var votes = countyData[i]["candidatevotes"]
        var party = countyData[i]["party"]

        if(countyFips !="undefined" &&countyFips != "NA"){
            if(Object.keys(formatted).indexOf(countyFips)>-1){
                if(Object.keys(formatted[countyFips]).indexOf(party)>-1){
                    formatted[countyFips][party][year]=votes
                }else{
                    formatted[countyFips][party]={}
                    formatted[countyFips][party][year]=votes
                }
            }else{
                formatted[countyFips]={}
                formatted[countyFips]["name"]=countyData[i]["county_name"]
                formatted[countyFips]["state"]=countyData[i].state
                formatted[countyFips][party]={}
                formatted[countyFips][party][year]=votes
            }
        }       
    }
    console.log(formatted)

var difference = {}
var years = [2000,2004,2008,2012,2016,2020]

for(var f in formatted){
        difference[f] = []

    years.forEach(function(d){
        if(formatted[f]["DEMOCRAT"]!=undefined){
            var dVotes = parseInt(formatted[f]["DEMOCRAT"][d])
            var rVotes = parseInt(formatted[f]["REPUBLICAN"][d])
            var dMinusR = Math.round((dVotes-rVotes)/(dVotes+rVotes)*10000)/100
            var total = dVotes+rVotes
            //console.log(f,d,dVotes,rVotes,difference)
            if(total==0){
                dMinusR=0
            }
            difference[f].push({year:d,dMinusR:dMinusR,sum:total,county:f,name:formatted[f]["name"],state:formatted[f]["state"]})
        }else{
            console.log(f,formatted[f])
        }
    
    })
}
    console.log(formatted)
    console.log(difference)
    return difference
}