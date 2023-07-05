// SET THE VARIABLES
var datafile = 'data/publigraphdata.json';
var zoomextent = [0.8, 50];
var clickcounter = 0;

var linkopacity_off = 0.2;
var linkopacity_on = 0.9;
var linkopacity_hidden = 0.1;

var labelopacity_off = 0.6;
var labelopacity_on = 1;
var labelopacity_hidden = 0.1;

var fontsizeOnmouseover = 130;
var fontsize = 60;

var nodes = [];
var links = [];

var linkvalue = 30;

var fromfilter = 'All';

//SET THE ZOOM HANDLER
var zoom = d3
	.zoom()
	.scaleExtent(zoomextent)
	.on("zoom", zoomed);

var svg = d3
	.select("#svggraph")
	.call(zoom)
	.on('click', function(){
		fromfilter = 'All';
		d3.selectAll('.values').text('-');
		document.getElementById('listofpublishers').value = '';
		drawgraph(nodes, links);
	})
	.append('g')
	.attr('class', 'gcontainer');

svg
	.append("g")
	.attr("class", "alllinks");

svg
	.append("g")
	.attr("class", "allnodes");

svg
	.append("g")
	.attr("class", "alltextnodes");

var slider = d3
	.select("#svgsliderlink")
	.append('g')
	.attr('class', 'gslider');

var width = parseInt(d3.select('#svggraph').style('width'), 10);
var height = parseInt(d3.select('#svggraph').style('height'), 10);
var sliderwidth = parseInt(d3.select('#svgsliderlink').style('width'), 10);
var sliderstart = 0.2 * height;
var widthorheight = Math.min(width, height);
var nodeslinksrange = [.005 * widthorheight, .03 * widthorheight];
var nodesradiusrange = [.012 * widthorheight, .07 * widthorheight];

// SET THE SLIDER
slider
	.append('rect')
	.attr('fill', '#777777')
	.attr('stroke', '#777777')
	.attr('x', sliderwidth / 2)
	.attr('y', sliderstart)
	.attr('width', 4)
	.attr('height', height - (2 * sliderstart))
	.attr('rx', 0)
	.attr('stroke-width', 3);

var sliderhandle = slider
	.append('circle')
	.attr('id', 'handle')
	.attr('fill', '#878787')
	.attr('stroke', '#878787')
	.attr('stroke-width', 2)
	.attr('cx', sliderwidth / 2)
	.attr('r', sliderwidth / 4);

slider
	.append('text')
	.attr('id', 'slidervalue')
	.attr('x', sliderwidth / 2)
	.attr('text-anchor', 'middle')
	.attr('dominant-baseline','middle')
	.attr('font-size', '1.5em')
	.attr('pointer-events', 'none ')
	.attr('fill', '#d1d1d1')
	.text(linkvalue);

// SET THE FORCES
var simulation = d3
	.forceSimulation()
	.force(
		"link", d3
			.forceLink()
			.strength(0)
			.id(function(d) {return d.publisherid; }) //Permet de faire le lien entre Nodes et Links (by "id")
	)
	.force(
		"charge", d3
			.forceManyBody()
			.strength(function(d){ return -100; })
		)
	.force("x", d3.forceX().x(function(d) { return width / 2; }).strength(.2))
	.force("y", d3.forceY().y(function(d) { return height / 2; }).strength(.2))
	.force("collide",d3.forceCollide( function(d) { return nodescale(d.size) + 15; } ).strength(1).iterations(4))
	.alphaMin(.01)
	.alphaDecay(.02);


d3.json(datafile, {credentials: 'same-origin'}).then(function(data) {
	//NODES
	data.nodes.publisherid.map(function(d, i){
		nodes.push({'publisherid' : `id${d}`, 'size' : data.nodes.size[i], 'publisher' : data.nodes.publisher[i], 'distinctdocid' : data.nodes.distinctdocid[i], 'mediannbdistinctdocidperiid' : data.nodes.mediannbdistinctdocidperiid[i], 'q75nbdistinctdocidperiid' : data.nodes.q75nbdistinctdocidperiid[i]});
	});
	
	//LINKS
	data.links.source.map(function(d, i){
		links.push({'source' : `id${d}`, 'target' : `id${data.links.target[i]}`, 'size' : data.links.size[i]});
	});

	//COLOR SCALE
	color = d3
		.scaleQuantize()
		.domain(d3.extent(nodes.map(function(d){ return d.size; })))
		.range([d3.schemeSet2[2], d3.schemeSet2[0], d3.schemeSet1[2], d3.schemeSet1[1], d3.schemeSet1[0]]);
	//d3.range(10).map(function(d) { return  d3.interpolateCool(d / 9); })

	//DATALIST OPTIONS
	d3
		.select('#listofpublishers')
		.selectAll('.puboption')
		.data(nodes)
		.enter()
		.append('option')
		.attr('class', 'puboption')
		.attr('value', function(d){ return d.publisher })
		.text(function(d){ return d.publisher });


	// SLIDER SCALE
	sliderscale = d3.scaleLinear()
		.domain([sliderstart, height - sliderstart])
		.range([0, d3.max(links.map(function(d){ return d.size; }))])

	d3
		.select("#slidervalue")
		.attr('y', sliderscale.invert(linkvalue));

	// SLIDER 
	sliderhandle
		.attr('cy', sliderscale.invert(linkvalue))
		.call(d3.drag()
			.on("drag", function() {
				filteredy = Math.max(sliderstart, Math.min((height - sliderstart), d3.event.y))
				linkvalue = Math.round(sliderscale(filteredy, 0));

				d3
					.select(this)
					.attr('cy', filteredy);
				d3
					.select("#slidervalue")
					.attr('y', filteredy)
					.text(`${linkvalue}`)

				drawgraph(nodes, links);
			})
		);
	// Remove cached input text
	document.getElementById('listofpublishers').value = '';
	drawgraph(nodes, links);
});



function drawgraph(nodes, links){

	//LINKS AND NODES FILTERED
	var linksfilterednodes = [];
	var linksfiltered = links
		.filter(function(d){
			let tempsource = (d.source.publisherid === undefined) ? d.source : d.source.publisherid;
			let temptarget = (d.target.publisherid === undefined) ? d.target : d.target.publisherid;
			return d.size >= linkvalue & 
			((fromfilter == 'All') ? false : (tempsource == fromfilter | temptarget == fromfilter))
		});
	linksfiltered.map(function(d){
			let tempsource = (d.source.publisherid === undefined) ? d.source : d.source.publisherid;
			let temptarget = (d.target.publisherid === undefined) ? d.target : d.target.publisherid;
			if(linksfilterednodes.indexOf(tempsource) < 0){linksfilterednodes.push(tempsource)};
			if(linksfilterednodes.indexOf(temptarget) < 0){linksfilterednodes.push(temptarget)};
		});

	var nodesfiltered = nodes
		.filter(function(d){ 
			if(fromfilter != 'All'){
				return linksfilterednodes.includes(d.publisherid) ;
			} else {
				return d.size >= linkvalue;
			};
		});

	// NODES AND LINKS SCALES
	nodescale = d3.scaleLinear()
		.domain(d3.extent(nodesfiltered.map(function(d){ return d.size; })))
		.range(nodesradiusrange);

	linkscale = d3.scaleLinear()
		.domain(d3.extent(linksfiltered.map(function(d){ return d.size; })))
		.range(nodeslinksrange);


	// LINKS
	var link = svg
		.select(".alllinks")
		.selectAll(".onelink")
		.data(linksfiltered, function(d){ return (d.source.id === undefined) ? `${d.source}${d.target}` : `${d.source.id}${d.target.id}`; });

	link.exit().remove();

	linkupd = link
		.enter()
		.append("line")
		.attr('class', "onelink")
		.merge(link)
		.style('stroke', '#999')
		.style('stroke-opacity', linkopacity_off)
		.attr("stroke-width", function(e) { return linkscale(e.size); })
		.on("mouseover", function(d){
			d3
				.selectAll('.onelink')
				.transition()
				.style('stroke-opacity', linkopacity_hidden);
			d3
				.selectAll('.nodetext')
				.transition()
				.style('opacity', labelopacity_hidden);
			d3
				.select(this)
				.transition()
				.style('stroke-opacity', linkopacity_on);
			d3
				.selectAll(".nodetext")
				.filter(function(e){ return e.publisherid == d.source.publisherid | e.publisherid == d.target.publisherid; })
				.transition()
				.style('font-size', (fontsizeOnmouseover) + '%')
				.style("opacity", labelopacity_on)
				.text(function(e){ return `${e.publisher} (${d.size})`; });
		})
		.on("mouseout", function(d){
			d3
				.selectAll('.onelink')
				.transition()
				.style('stroke-opacity', linkopacity_off);

			d3
				.selectAll(".nodetext")
				.transition()
				.style('font-size', (fontsize) + '%')
				.style("opacity", labelopacity_off)
				.text(function(e){ return e.publisher; });
		})
		.on('click', function(d){				
			//SELECT THE LINK
			//drawgraph(nodes, links);
		});

	// NODES
	groupnode = svg
		.select(".allnodes")
		.selectAll(".onenode")
		.data(nodesfiltered, function(d){ return d.publisherid; });

	groupnode.exit().remove();

	groupnode
		.transition()
		.ease(d3.easeExpOut)
		.duration(1000)
		.attr("r", function(d) { return nodescale(d.size); });

	groupnodeupd = groupnode
		.enter()
		.append("circle")
		.attr("class", "onenode")
		.call(d3.drag()
			.on("start", dragstarted)
			.on("drag", dragged)
			.on("end", dragended))
		.attr("fill", function(d) { return color(d.size); })
		.attr("r", function(d) { return nodescale(d.size); })
		.merge(groupnode)
		.attr('stroke', function(d){ return (d.publisherid == fromfilter) ? 'white' : null; } )
		.attr('stroke-width', function(d){ return (d.publisherid == fromfilter) ? 3 : null; })
		.on("mouseover", function(d){
			d3
				.selectAll('.onelink')
				.transition()
				.style('stroke-opacity', linkopacity_hidden);
			d3
				.selectAll('.nodetext')
				.transition()
				.style('opacity', labelopacity_hidden);
			d3
				.selectAll(".nodetext")
				.filter(function(e){ return e.publisherid == d.publisherid; })
				.transition()
				.style('font-size', (fontsizeOnmouseover) + '%')
				.style("opacity", labelopacity_on)
				.text(function(e){ return `${e.publisher} (${e.size})`; });
			d3
				.select(this)
				.transition()
				.attr("r", nodesradiusrange[1]);
			d3
				.selectAll(".onelink")
				.filter(function(e){ return (d.publisherid == e.source.publisherid || d.publisherid == e.target.publisherid); })
				.transition()
				.style('stroke', function(e){ return color(d.size); })
				.style('stroke-opacity', function(e){ return linkopacity_on; });
		})
		.on("mouseout", function(d){
			d3
				.selectAll('.onelink')
				.transition()
				.style('stroke', '#999')
				.style('stroke-opacity', linkopacity_off);

			d3
				.selectAll(".nodetext")
				//.filter(function(e){ return e.publisherid == d.publisherid; })
				.transition()
				.style('font-size', (fontsize) + '%')
				.style("opacity", labelopacity_off)
				.text(function(e){ return e.publisher; });
			d3
				.select(this)
				.transition()
				.attr("r", function(a) { return nodescale(a.size); });
		})
		.on("click", function(d){
			document.getElementById('listofpublishers').value = d.publisher;
			filteronpub(d);
			// To avoid the SVG click (removing the filter)
			d3.event.stopPropagation()

		});
	d3
		.select('#listofpublishers')
		.on('change', function(){
			var temp;
			var that = this.value;
			nodes.map(function(d){
				if(d.publisher == that){
					temp = d;
				};
			});
			filteronpub(temp);
		});

	/*d3
		.select('#okbutton')
		.on('click', function(){
			var temp;
			var that = document.getElementById('listofpublishers').value;
			nodes.map(function(d){
				if(d.publisher == that){
					temp = d;
				};
			});
			filteronpub(temp);
		})
	*/
	function filteronpub(pubobj){
		fromfilter = pubobj.publisherid;
		d3.select('#iidvalue').text(pubobj.size);
		d3.select('#docidvalue').text(pubobj.distinctdocid);
		d3.select('#medianvalue').text(Math.round(pubobj.mediannbdistinctdocidperiid));
		d3.select('#sevfivevalue').text(Math.round(pubobj.q75nbdistinctdocidperiid));
		drawgraph(nodes, links);		
	}

	// TEXT NODES
	textnode = svg
		.select(".alltextnodes")
		.selectAll(".nodetext")
		.data(nodesfiltered, function(d){ return d.publisherid; });

	textnode.exit().remove();

	textnodeupd = textnode
		.enter()
		.append("text")
		.attr('class', "nodetext")
		.attr('fill', 'white')
		.merge(textnode)
		.attr('text-anchor', "middle")
		.style('font-size', (fontsize) + '%')
		.style("opacity", labelopacity_off)
		.attr("pointer-events", "none")
		.text(function(d) { return d.publisher });

	// RUN THE FORCES
	simulation
		.nodes(nodesfiltered) //Replace with 'viznodesfiltered' if update of forces is needed while filter is changing - 'nodes' otherwise
		.on("tick", ticked);

	simulation
		.force("link")
		.links(linksfiltered); //Replace with 'vizlinksfiltered' if update of forces is needed while filter is changing - 'links' otherwise

	simulation.nodes(nodesfiltered).alpha(0.5).restart();

	$(window).on('resize', function(){ simulation.nodes(nodesfiltered).alpha(0.5).restart(); });
};

function ticked() {
	var radius = nodesradiusrange[1];
	var localwidth = width;
	var localheight = height;

	function xlim (a) { return Math.max(radius, Math.min(localwidth - radius, a)); };
	function ylim(b) { return Math.max(radius, Math.min(localheight - radius, b)); };
	
	groupnodeupd
		.attr("cx", function(d) { return xlim(d.x); })
		.attr("cy", function(d) { return ylim(d.y); });

	textnodeupd
		.attr("dx", function(d){ return xlim(d.x); })
		.attr("dy", function(d){ return ylim(d.y /*+ nodescale(d.size)/2*/); });

	linkupd
		.attr("x1", function(d) { return xlim(d.source.x); })
		.attr("y1", function(d) { return ylim(d.source.y); })
		.attr("x2", function(d) { return xlim(d.target.x); })
		.attr("y2", function(d) { return ylim(d.target.y); });
};

function zoomed(){
	svg.attr("transform", d3.event.transform);
};

function dragstarted(d) { 
	simulation.alphaTarget(0.3).restart();
	d.fx = d.x;
	d.fy = d.y;
};

function dragged(d) {
	d.fx = d3.event.x;
	d.fy = d3.event.y;
};

function dragended(d) {
	//simulation.alphaTarget(0);
	if(clickcounter%2 == 0){
		d.fx = null;
		d.fy = null;
	};
};