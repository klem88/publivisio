let dbname = param.db;
let datafile = 'data/' + dbname + 'data.json';
let datacolorassocapiurl = "http://dmaster-d25.staging-cyberlibris.com/explovizapi/index.php?db=" + dbname + "datacolorassoc&action=datacolorassoc";

let lang = param.lang;

let bookscovers = {};

let nodes = [];
let links = [];


let docidfilter = {};
let referencePublishers = {};
let referenceNiveau1 = {};
let referenceNiveau2 = {};
let referenceIntitutions = {};
let referenceCountries = {};


// TRADUCTION
if (lang == 'fr') {

	d3.select('#paramlinklabellib').text('Livres en commun :');
	d3.select('#numberofbooks').text('Nombre de livres :');
	// COUNTRIES
	d3.select('#allCountrieslib').text('Pays :');
	d3.select('#allCountries').text('Tous');
	d3.select('.showCountriesDiv').text('Modifier');
	// INSTITUTIONS
	d3.select('#allInstitutionslib').text('Institutions :');
	d3.select('#allInstitutions').text('Toutes');
	d3.select('.showInstitutionsDiv').text('Modifier');
	// PUBLISHERS
	d3.select('#allPublisherslib').text('Editeurs :')
	d3.select('#allPublishers').text('Tous');
	d3.select('.showPublishersDiv').text('Modifier');
	// NIVEAU 1
	d3.select('#allThemeslib').text('Niveau 1 :')
	d3.select('#allThemes').text('Tous');
	d3.select('.showDecitreDiv').text('Modifier');
	// NIVEAU 2
	d3.select('#allCyberclasslib').text('Niveau 2 :')
	d3.select('#allCyberclass').text('Tous');
	d3.select('.showCyberclassDiv').text('Modifier');
	// ALL KEYWORDS
	var allcountrieskeyword = 'Tous';
	var allinstitutionskeyword = 'Toutes';
	var allpublisherskeyword = 'Tous';
	var allniveau1keywords = 'Tous';	
	var allniveau2keywords = 'Tous';	

	d3.select('#headerlogo').attr('src', 'images/mainLogo_fr.jpg');

} else if (lang == 'en') {
	d3.select('#paramlinklabellib').text('Books in common :');
	d3.select('#numberofbooks').text('Number of books :');
	// COUNTRIES
	d3.select('#allCountrieslib').text('Countries :');
	d3.select('#allCountries').text('All');
	d3.select('.showCountriesDiv').text('Modify');
	// INSTITUTIONS
	d3.select('#allInstitutionslib').text('Institutions :');
	d3.select('#allInstitutions').text('All');
	d3.select('.showInstitutionsDiv').text('Modify');
	// PUBLISHERS
	d3.select('#allPublisherslib').text('Publishers :')
	d3.select('#allPublishers').text('All');
	d3.select('.showPublishersDiv').text('Modify');
	// NIVEAU 1
	d3.select('#allThemeslib').text('Level 1 :')
	d3.select('#allThemes').text('All');
	d3.select('.showDecitreDiv').text('Modify');
	// NIVEAU 2
	d3.select('#allCyberclasslib').text('Level 2 :')
	d3.select('#allCyberclass').text('All');
	d3.select('.showCyberclassDiv').text('Modify');
	// ALL KEYWORDS
	var allcountrieskeyword = 'All';
	var allinstitutionskeyword = 'All';
	var allpublisherskeyword = 'All';
	var allniveau1keywords = 'All';
	var allniveau2keywords = 'All';

	d3.select('#headerlogo').attr('src', 'images/mainLogo_en.jpg');
};

// SET THE VARIABLES
let countryvalue = allcountrieskeyword;
let institutionvalue = allinstitutionskeyword; 
let publivalue = allpublisherskeyword;
var niveau1value = [allniveau1keywords];
var niveau2value = [allniveau2keywords];

var nodeslinksrange = [5, 15];
var nodesradiusrange = [15, 35];
var zoomextent = [1, 5];

var linkopacity_off = 0.1;
var linkopacity_on = 0.6;

var labelopacity_off = 0.4;
var labelopacity_on = 1;

var coverheight = 100;
var start_nb = 0;
var fontsizeOnmouseover = '120%';
var fontsize = '60%';

let nbcoverstoshow = 10;
let minlinkvalueconst = 25;
let minlinkvalue = minlinkvalueconst;

//var color = d3.scaleOrdinal(d3.schemeCategory20);
//Additional colors from https://jnnnnn.blogspot.fr/2017/02/distinct-colours-2.html
var color = d3
	.scaleOrdinal()
	.range(d3.schemeCategory20.concat(["#1b70fc", "#d50527", "#158940", "#f898fd", "#24c9d7", "#cb9b64", "#866888", "#22e67a", "#e509ae", "#9dabfa", "#437e8a", "#b21bff", "#ff7b91", "#94aa05", "#ac5906", "#82a68d", "#fe6616", "#7a7352", "#f9bc0f", "#b65d66", "#07a2e6", "#c091ae", "#8a91a7", "#88fc07", "#ea42fe", "#9e8010", "#10b437", "#c281fe", "#f92b75", "#07c99d", "#a946aa", "#bfd544", "#16977e", "#ff6ac8", "#a88178", "#5776a9", "#678007", "#fa9316", "#85c070", "#6aa2a9", "#989e5d", "#fe9169", "#cd714a", "#6ed014", "#c5639c", "#c23271", "#698ffc", "#678275", "#c5a121", "#a978ba", "#ee534e", "#d24506", "#59c3fa", "#ca7b0a", "#6f7385", "#9a634a", "#48aa6f", "#ad9ad0", "#d7908c"]));

var width = '100vw';
var height = '100vh';

//var linkvalue = 250;
var minlinkvaluewithall = 100;

var baseurl = '../catalog/index.html?';
var imgurl = 'http://static.cyberlibris.fr/books_upload/300pix/';

//SET THE ZOOM HANDLER
var zoom = d3
	.zoom()
	.scaleExtent(zoomextent)
	.on("zoom", zoomed);

// SET THE DIV AND SGV AND G
d3
	.select('.graphVisualisation')	
	.append('svg')
	.attr('class', 'svggraph')
	.attr('width', width)
	.attr('height', height)
	.call(zoom);

var svg = d3
	.select(".svggraph")
	.append('g')
	.attr('class', 'gcontainer');

svg
	.append("g")
	.attr("class", "allcoversFR");

svg
	.append("g")
	.attr("class", "allcoversEN");

svg
	.append("g")
	.attr("class", "alllinks");

svg
	.append("g")
	.attr("class", "allnodes");

svg
	.append("g")
	.attr("class", "alltextnodes");

// SET THE FORCES
var simulation = d3
	.forceSimulation()
	.force(
		"link", d3
			.forceLink()
			.id(function(d) {return d.iid; }) //Permet de faire le lien entre Nodes et Links (by "id")
	)
	.force(
		"charge", d3
			.forceManyBody()
			.strength(function(d){ return -1000; })
		)

	//.force("center", d3.forceCenter(parseInt(d3.select('.svggraph').style('width'), 10) / 2, parseInt(d3.select('.svggraph').style('height'), 10) / 2))
	.force("x", d3.forceX().x(function(d) { return parseInt(d3.select('.svggraph').style('width'), 10) / 2; }).strength(.5))
	.force("y", d3.forceY().y(function(d) { return parseInt(d3.select('.svggraph').style('height'), 10) / 2; }).strength(.5))
	.force("collide",d3.forceCollide( function(d) { return nodescale(d.docid.length) + 15; } ).strength(1).iterations(1))
	.alphaMin(.01)
	.alphaDecay(.02);

// READ THE GRAPH DATASET
d3.json(datafile, function(error, data) {
	if (error) return console.warn(error);
	//Retrieve the cover urls. Asynchronous work.
	getcovers()
	
	//NODES
	data.nodes.iid.map(function(d, i){
		nodes.push({'iid' : d, 'docid' : data.nodes.docid[i].split(',')});
		links.push({'source' : d, 'target' : d, 'docid' : data.nodes.docid[i].split(',')});
	});
	
	//LINKS
	data.links.iidsource.map(function(d, i){
		links.push({'source' : d, 'target' : data.links.iidtarget[i], 'docid' : data.links.docid[i].split(',')});
	});

	//FILTER LISTS
	data.countries.id.map(function(d, i){
		referenceCountries[d] = {'name' : data.countries.country_fr[i], 'weight' : null};
	});
	data.institutions.iid.map(function(d, i){
		referenceIntitutions[d] = {'countryid' : data.institutions.countryid[i], 'name' : data.institutions.name[i], 'weight' : null};
	});
	data.publishers.publisherid.map(function(d, i){
		referencePublishers[d] = {'name' : data.publishers.publishername[i], 'weight' : null};
	});
	data.niveau1.niveau1.map(function(d, i){
		referenceNiveau1[d] = {'name' : data.niveau1.name[i], 'weight' : null};
	});
	data.niveau2.niveau2.map(function(d, i){
		referenceNiveau2[d] = {'name' : data.niveau2.name[i], 'weight' : null};
	});

	//FILTER DOCID TABLE
	data.booksfilter.docid.map(function(d, i){
		docidfilter[d] = {'lang' : data.booksfilter.lang[i], 'niveau1' : data.booksfilter.niveau1[i], 'niveau2' : data.booksfilter.niveau2[i], 'publisherid' : data.booksfilter.publisherid[i]}
	});

	detailedfilter();
});

// ENTER IN EACH LINK + EACH NODE AND FILTER THE DOCIDs (HEAVY PERF CALC)
// Create global variables nodesdetails and linksdetails
function detailedfilter(){
	// COPY THE ORIGINAL NODES AND LINKS 
	nodesdetails = JSON.parse(JSON.stringify(nodes));
	linksdetails = JSON.parse(JSON.stringify(links));

	if (!(publivalue == allpublisherskeyword & niveau1value == allniveau1keywords & niveau2value == allniveau2keywords)){
		//// FILTER THE DOCID
		let filtereddocid = [];
		d3.keys(docidfilter).map(function(d){
			let temppubli = (publivalue == allpublisherskeyword) ? true : docidfilter[d].publisherid == publivalue;
			let tempdeci = (niveau1value == allniveau1keywords) ? true : docidfilter[d].niveau1 == niveau1value;
			let tempclass = (niveau2value == allniveau2keywords) ? true : docidfilter[d].niveau2 == niveau2value;
			(temppubli & tempdeci & tempclass) ? filtereddocid.push(Number(d)) : null;
		});
		
		//// FILTER THE NODES
		//ON FILTRE LES DOCID DANS CHAQUE NOEUD
		for (var i = 0; i < nodesdetails.length; i++) {
			nodesdetails[i]['docid'] = nodesdetails[i]['docid'].filter(function(e){ return filtereddocid.includes(Number(e)); });
		};

		//// FILTER THE LINKS
		// ON FILTRE LES DOCID DANS CHAQUE LIEN
		for (var i = 0; i < linksdetails.length; i++) {
			linksdetails[i]['docid'] = linksdetails[i]['docid'].filter(function(e){ return filtereddocid.includes(Number(e)); });
		};

		//// FILTER THE NODES
		// EXTRACT UNIQUE IID FROM THE VISLINKS
		/*let tempiid = linksdetails
			.map(function(d){ return (d.source.iid === undefined) ? d.source : d.source.iid; })
			.concat(linksdetails.map(function(d){ return (d.target.iid === undefined) ? d.target : d.target.iid; }))
		// UNIQUE IID
		tempiid = tempiid.filter(function(d, i){ return tempiid.indexOf(d) == i; });
		//FILTER NODES	
		nodesdetails = nodesdetails.filter(function(d){
			return tempiid.includes(d.iid);
		});
		//ON FILTRE LES DOCID DANS CHAQUE NOEUD
		for (var i = 0; i < nodesdetails.length; i++) {
			nodesdetails[i]['docid'] = nodesdetails[i]['docid'].filter(function(e){ return filtereddocid.includes(Number(e)); });
		};*/	
	} else if (countryvalue != allcountrieskeyword){
		null
	} else {
		linksdetails = linksdetails.filter(function(d){ return d.source != d.target; })
	};
	
	aggregatedfilter();
};

// FILTER ONLY THE INSTITUTION AND THE LINK VALUE LEVEL (GRAPH LEVEL AGGREGATED FILTER)
// Create local variables visnodes and vislinks
function aggregatedfilter(searchlinkvalue){	
	//// FILTER THE LINKS
	// FILTER INSTITUTIONS BY COUNTRY IF NEEDED
	if (!(countryvalue == allcountrieskeyword)){
		var vislinks = linksdetails.filter(function(d){
			// Filter institution value + country value
			let tempsource = (d.source.iid === undefined) ? d.source : d.source.iid;
			let temptarget = (d.target.iid === undefined) ? d.target : d.target.iid;
			return (referenceCountries[referenceIntitutions[tempsource].countryid].name == countryvalue & 
				referenceCountries[referenceIntitutions[temptarget].countryid].name == countryvalue);
		});
	} else { 
		var vislinks = JSON.parse(JSON.stringify(linksdetails));//linksdetails.filter(function(d){ return true; });
	};
	// FILTER INSTITUTIONS IF NEEDED
	if (!(institutionvalue == allinstitutionskeyword)){
		vislinks = vislinks.filter(function(d){
			// Filter institution value + country value
			let tempsource = (d.source.iid === undefined) ? d.source : d.source.iid;
			let temptarget = (d.target.iid === undefined) ? d.target : d.target.iid;
			return (referenceIntitutions[tempsource].name == institutionvalue || 
				referenceIntitutions[temptarget].name == institutionvalue);
		});
	};

	// DEFINE MIN / MAX AND LINKVALUE (average)
	minlinkvalue = (countryvalue == allcountrieskeyword & institutionvalue == allinstitutionskeyword & publivalue == allpublisherskeyword & niveau1value == allniveau1keywords & niveau2value == allniveau2keywords) ? minlinkvalueconst : 0;
	maxlinkvalue = d3.max(vislinks.map(function(d){ return d.docid.length; }));

	if (!(searchlinkvalue == false)){linkvalue = Math.floor((maxlinkvalue - minlinkvalue) / 4)};
	
	// FILTER THE LINKS BELOW THE LINKVALUE
	vislinks = vislinks.filter(function(d){
		return d.docid.length > linkvalue;
	});
	
	//// FILTER THE NODES
	// EXTRACT UNIQUE IID FROM THE VISLINKS
	let tempiid = vislinks
		.map(function(d){ return (d.source.iid === undefined) ? d.source : d.source.iid; })
		.concat(vislinks.map(function(d){ return (d.target.iid === undefined) ? d.target : d.target.iid; }));
	// UNIQUE IID (cette méthode consomme beaucoup moins de perf)
	let tempuniqueiid = [];
	let seen = d3.set();
	for (let index = 0; index < tempiid.length; index++) {
		let value = tempiid[index];
		if (!(seen.has(value))){
			seen.add(value);
			tempuniqueiid.push(value);
		};
	};

	//FILTER NODES	
	let visnodes = nodesdetails.filter(function(d){
			return tempuniqueiid.includes(d.iid);
		});

	// UPDATE INFO ON EACH FILTER VALUE
	// EXTRACT THE UNIQUE DOCID FROM THE REMAINING NODES
	let tempdocid = [];
	visnodes.map(function(d){ return d.docid.map(function(e){ tempdocid.push(e) }); })
	// UNIQUE DOCID  (cette méthode consomme beaucoup moins de perf)
	let tempuniquedocid = [];
	seen = d3.set();
	for (let index = 0; index < tempdocid.length; index++) {
		let value = tempdocid[index];
		if (!(seen.has(value))){
			seen.add(value);
			tempuniquedocid.push(value);
		};
	};

	//COUNTRIES
	let temp = visnodes.map(function(d){
		return referenceIntitutions[d.iid].countryid;
	});
	let tempcountries = d3.nest()
		.key(function(d){ return d; })
		.rollup(function(d){ return d.length; })
		.object(temp);
	d3.keys(referenceCountries).map(function(d){
		referenceCountries[d].weight = (tempcountries[d] === undefined) ? 0 : tempcountries[d];
	});
	// INSTITUTIONS
	let tempinst = {};
	visnodes.map(function(d){
		tempinst[d.iid] = d.docid.length;
	});
	d3.keys(referenceIntitutions).map(function(d){
		referenceIntitutions[d].weight = (tempinst[d] === undefined) ? 0 : tempinst[d];
	});	
	// PUBLISHERS
	temp = tempuniquedocid.map(function(d){
		return docidfilter[d].publisherid;
	});
	let temppubli = d3.nest()
		.key(function(d){ return d; })
		.rollup(function(d){ return d.length; })
		.object(temp);
	
	d3.keys(referencePublishers).map(function(d){
		referencePublishers[d].weight = (temppubli[d] === undefined) ? 0 : temppubli[d];
	});
	// NIVEAU1
	temp = tempuniquedocid.map(function(d){
		return docidfilter[d].niveau1;
	});
	let tempniv1 = d3.nest()
		.key(function(d){ return d; })
		.rollup(function(d){ return d.length; })
		.object(temp);
	
	d3.keys(referenceNiveau1).map(function(d){
		referenceNiveau1[d].weight = (tempniv1[d] === undefined) ? 0 : tempniv1[d];
	});
		// NIVEAU2
	temp = tempuniquedocid.map(function(d){
		return docidfilter[d].niveau2;
	});
	let tempniv2 = d3.nest()
		.key(function(d){ return d; })
		.rollup(function(d){ return d.length; })
		.object(temp);
	
	d3.keys(referenceNiveau2).map(function(d){
		referenceNiveau2[d].weight = (tempniv2[d] === undefined) ? 0 : tempniv2[d];
	});

	update(visnodes, vislinks, searchlinkvalue);
};

// UPDATE THE GRAPH BASED ON THE VISNODES AND VISLINKS CALCULATED
function update(visnodes, vislinks, searchlinkvalue) {

	// DEFINE THE SCALES BASED ON THE FILTERED INFO (vizlinksfiltered and viznodesfiltered) 
	nodescale = d3.scaleLinear()
		.domain(d3.extent(visnodes.map(function(d){ return d.docid.length; })))
		.range(nodesradiusrange);

	linkscale = d3.scaleLinear()
		.domain(d3.extent(vislinks.map(function(d){ return d.docid.length; })))
		.range(nodeslinksrange);

	function sortfilternames(a,b){ return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); };
	
	function datareference(keyword, referencearray){
		let temp = d3.entries(referencearray).map(function(d){
			return {'id' : d.key, 'name' : d.value.name, 'weight' : d.value.weight};
		});
		return [{'name' : keyword, 'weight' : -1}]
			.concat(temp//d3.values(referencearray)
				.filter(function(d){ return d.weight > 0; })
				.sort(sortfilternames))
			.concat(temp//d3.values(referencearray)
				.filter(function(d){ return d.weight <= 0; })
				.sort(sortfilternames));
	};

	// UPDATE THE LISTS
	// COUNTRIES
	var option = d3
		.select('.countriesDiv')
		.selectAll('.checkbox')
		.data(datareference(allcountrieskeyword, referenceCountries), function(d, i){ return d.name + d.weight + i; });

	option.exit().remove();
	
	var optionenter = option
		.enter()
		.append('p')
		.attr('class', 'checkbox')
		.merge(option)
		.text(function(d){ return (d.name == allcountrieskeyword) ? allcountrieskeyword : `${d.name} (${d.weight})`; })
		.classed('inactive', function(d){ return (d.weight == 0) ? true : false; })
		.on("click", function(d) {
			countryvalue = d.name;
			d3
				.select('#allCountries')
				.text(d.name);
			detailedfilter();
		});

	// INSTITUTIONS
	var option = d3
		.select('.institutionsDiv')
		.selectAll('.checkbox')
		.data(datareference(allinstitutionskeyword, referenceIntitutions), function(d, i){ return d.name + d.weight + i; });

	option.exit().remove();
	
	var optionenter = option
		.enter()
		.append('p')
		.attr('class', 'checkbox')
		.merge(option)
		.text(function(d){ return (d.name == allinstitutionskeyword) ? allinstitutionskeyword : `${d.name} (${d.weight})`; })
		.classed('inactive', function(d){ return (d.weight == 0) ? true : false; })
		.on("click", function(d) {
			institutionvalue = d.name;
			d3
				.select('#allInstitutions')
				.text(d.name);
			aggregatedfilter();
		});

	// PUBLISHERS
	var publi = d3
		.select('.publishersDiv')
		.selectAll('.checkbox')
		.data(datareference(allpublisherskeyword, referencePublishers), function(d, i){ return d.name + d.weight + i; });
	
	publi.exit().remove();
	
	var publienter = publi
		.enter()
		.append('p')
		.attr('class', 'checkbox')
		.merge(publi)
		.text(function(d){ return (d.name == allpublisherskeyword) ? allpublisherskeyword : `${d.name} (${d.weight})`; })
		.classed('inactive', function(d){ return (d.weight == 0) ? true : false; })
		.on("click", function(d) {
			publivalue = (d.name == allpublisherskeyword) ? allpublisherskeyword : d.id;
			
			d3
				.select('#allPublishers')
				.text(d.name);
			detailedfilter();
		});

	// NIVEAU 1
	var key = d3
		.select('.decitreDiv')
		.selectAll('.checkbox')
		.data(datareference(allniveau1keywords, referenceNiveau1), function(d, i){ return d.name + d.weight + i; });
	
	key.exit().remove();
	
	var keyenter = key
		.enter()
		.append('p')
		.attr('class', 'checkbox')
		.merge(key)
		.text(function(d){ return (d.name == allniveau1keywords) ? allniveau1keywords : `${d.name} (${d.weight})`; })
		.classed('inactive', function(d){ return (d.weight == 0) ? true : false; })
		.on("click", function(d) {
			niveau1value = (d.name == allniveau1keywords) ? allniveau1keywords : d.id;
			d3
				.select('#allThemes')
				.text(d.name);
			detailedfilter();
		});

	// NIVEAU 2
	var cyber = d3
		.select('.cyberclassDiv')
		.selectAll('.checkbox')
		.data(datareference(allniveau2keywords, referenceNiveau2), function(d, i){ return d.name + d.weight + i; });
	
	cyber.exit().remove();
	
	var cyberenter = cyber
		.enter()
		.append('p')
		.attr('class', 'checkbox')
		.merge(cyber)
		.text(function(d){ return (d.name == allniveau2keywords) ? allniveau2keywords : `${d.name} (${d.weight})`; })
		.classed('inactive', function(d){ return (d.weight == 0) ? true : false; })
		.on("click", function(d) {
			niveau2value = (d.name == allniveau2keywords) ? allniveau2keywords : d.id;
			d3
				.select('#allCyberclass')
				.text(d.name);
			detailedfilter();
		});

	// FREE THE NODES BUTTON
	d3
		.select('.freeNodesDiv')
		.on('click', function(){
			visnodes.map(function(d){
				d.fx = null;
				d.fy = null;
			});
			simulation.alpha(0.2).restart()
		});

	// LINKS
	var link = svg
		.select(".alllinks")
		.selectAll(".onelink")
		.data(vislinks, function(d){ return `${d.source} ${d.target}`; });

	link.exit().remove();

	linkupd = link
		.enter()
		.append("line")
		.attr('class', "onelink")
		.merge(link)
		.style('stroke', '#999')
		.style('stroke-opacity', linkopacity_off)
		.attr("stroke-width", function(d) { return linkscale(d.docid.length); })
		.on("mouseover", function(d){
			d3
				.select(this)
				.transition()
				.style('stroke', '#999')
				.style('stroke-opacity', linkopacity_on);
			d3
				.selectAll(".nodetext")
				.filter(function(e){ return e.iid == d.source.iid || e.iid == d.target.iid; })
				.transition()
				.style('font-size', fontsizeOnmouseover)
				.style("opacity", labelopacity_on);
		})
		.on("mouseout", function(d){
			d3
				.select(this)
				.transition()
				.style('stroke', '#999')
				.style('stroke-opacity', linkopacity_off);
			d3
				.selectAll(".nodetext")
				.filter(function(e){ return e.iid == d.source.iid || e.iid == d.target.iid; })
				.transition()
				.style('font-size', '50%')
				.style("opacity", labelopacity_off);
		})
		.on('click', function(d){
			// SHOW THE BOTTOM PANE
			d3
				.select('.bottomViewer')
				.attr('class', 'bottomViewer');
			// UPDATE NAME AND NUMBER
			d3
				.select('#institutionsname')
				.text(`${referenceIntitutions[d.source.iid].name}-${referenceIntitutions[d.target.iid].name}`);
			d3
				.select('#thenumber')
				.text(d.docid.length);
			// UPDATE THE COVERS
			var coversFR = d3
				.select('.itemsContainerFR #itemimg')
				.selectAll('.item')
				.data(d.docid
					.filter(function(f){ return docidfilter[f].lang == 'fr'; })
					.slice(0, nbcoverstoshow)
					.map(function(e){ return {'docid' : e, 'coverurl' : bookscovers[e]}; }),
				function(u){ return u.docid; });
			
			coversFR.exit().remove();
			
			coversFR
				.enter()
				.append('div')
				.attr('class', 'item')
				.append('a')
				.attr('href', '#')
				.append('img')
				.attr("src", function(e) { return imgurl + e.coverurl; })
				.on('mouseover', function(e){ coveronmouseover(e.docid); })
				.on('mouseout', coveronmouseout)
				.style('opacity', 1e-6)
				.transition()
				.duration(1000)
				.style('opacity', 1);

			var coversEN = d3
				.select('.itemsContainerEN #itemimg')
				.selectAll('.item')
				.data(d.docid
					.filter(function(f){ return docidfilter[f].lang == 'en'; })
					.slice(0, nbcoverstoshow)
					.map(function(e){ return {'docid' : e, 'coverurl' : bookscovers[e]}; }),
				function(u){ return u.docid; });
			
			coversEN.exit().remove();
			
			coversEN
				.enter()
				.append('div')
				.attr('class', 'item')
				.append('a')
				.attr('href', '#')
				.append('img')
				.attr("src", function(e) { return imgurl + e.coverurl; })
				.on('mouseover', function(e){ coveronmouseover(e.docid); })
				.on('mouseout', coveronmouseout)
				.style('opacity', 1e-6)
				.transition()
				.duration(1000)
				.style('opacity', 1);
			// Mise à jour de l'URL
			d3
				.select('.itemsContainerFR')
				.select('.moreCovers')
				.select('a')
				.attr('target', '_blank')
				.attr('href', urlVersCyberlibris(d.source.iid, d.target.iid, 'fr'));
				
			d3
				.select('.itemsContainerEN')
				.select('.moreCovers')
				.select('a')
				.attr('target', '_blank')
				.attr('href', urlVersCyberlibris(d.source.iid, d.target.iid, 'en'));				
		});

	// NODES
	groupnode = svg
		.select(".allnodes")
		.selectAll(".onenode")
		.data(visnodes, function(d){ return `iid${d.iid}`; });

	groupnode.exit().remove();

	groupnodeupd = groupnode
		.enter()
		.append("circle")
		.attr("class", "onenode")
		.call(d3.drag()
			.on("start", dragstarted)
			.on("drag", dragged)
			.on("end", dragended))
		.attr("fill", function(d) { return color(d.iid); })
		.merge(groupnode)
		.attr("r", function(d) { return nodescale(d.docid.length); })
		.on("mouseover", function(d){

			d3
				.selectAll(".nodetext")
				.filter(function(e){ return e.iid == d.iid; })
				.transition()
				.style('font-size', fontsizeOnmouseover)
				.style("opacity", labelopacity_on)
				.text(function(e){ return referenceIntitutions[d.iid].name + ' (' + d.docid.length + ')'; });
			d3
				.select(this)
				.transition()
				.attr("r", nodesradiusrange[1]);
			d3
				.selectAll(".onelink")
				.filter(function(e){ return d.iid == e.source.iid || d.iid == e.target.iid; })
				.transition()
				.style('stroke', function(e){ return color(d.group); })
				.style('stroke-opacity', function(e){ return linkopacity_on; });
		})
		.on("mouseout", function(d){
			d3
				.selectAll(".nodetext")
				.filter(function(e){ return e.iid == d.iid; })
				.transition()
				.style('font-size', '50%')
				.style("opacity", labelopacity_off)
				.text(function(e){ return referenceIntitutions[e.iid].name; });
			d3
				.select(this)
				.transition()
				.attr("r", function(e) { return nodescale(d.docid.length); });
			d3
				.selectAll(".onelink")
				.filter(function(e){ return d.id == e.source.id || d.id == e.target.id; })
				.transition()
				.style('stroke', '#999')
				.style('stroke-opacity', linkopacity_off);
		})
		.on("click", function(d){
			// SHOW THE BOTTOM PANE
			d3
				.select('.bottomViewer')
				.attr('class', 'bottomViewer');
			// UPDATE NAME AND NUMBER
			d3
				.select('#institutionsname')
				.text(referenceIntitutions[d.iid].name);
			d3
				.select('#thenumber')
				.text(d.docid.length);
			// UPDATE THE COVERS
			var coversFR = d3
				.select('.itemsContainerFR #itemimg')
				.selectAll('.item')
				.data(d.docid
					.filter(function(f){ return docidfilter[f].lang == 'fr'; })
					.slice(0, nbcoverstoshow)
					.map(function(e){ return {'docid' : e, 'coverurl' : bookscovers[e]}; }),
				function(u){ return u.docid; });
			
			coversFR.exit().remove();
			
			coversFR
				.enter()
				.append('div')
				.attr('class', 'item')
				.append('a')
				.attr('href', '#')
				.append('img')
				.attr("src", function(e) { return imgurl + e.coverurl; })
				.on('mouseover', function(e){ coveronmouseover(e.docid); })
				.on('mouseout', coveronmouseout)
				.style('opacity', 1e-6)
				.transition()
				.duration(1000)
				.style('opacity', 1);

			var coversEN = d3
				.select('.itemsContainerEN #itemimg')
				.selectAll('.item')
				.data(d.docid
					.filter(function(f){ return docidfilter[f].lang == 'en'; })
					.slice(0, nbcoverstoshow)
					.map(function(e){ return {'docid' : e, 'coverurl' : bookscovers[e]}; }),
				function(u){ return u.docid; });
			
			coversEN.exit().remove();
			
			coversEN
				.enter()
				.append('div')
				.attr('class', 'item')
				.append('a')
				.attr('href', '#')
				.append('img')
				.attr("src", function(e) { return imgurl + e.coverurl; })
				.on('mouseover', function(e){ coveronmouseover(e.docid); })
				.on('mouseout', coveronmouseout)
				.style('opacity', 1e-6)
				.transition()
				.duration(1000)
				.style('opacity', 1);

			// Mise à jour de l'URL
			d3
				.select('.itemsContainerFR')
				.select('.moreCovers')
				.select('a')
				.attr('target', '_blank')
				.attr('href', urlVersCyberlibris(d.iid, d.iid, 'fr'));

			d3
				.select('.itemsContainerEN')
				.select('.moreCovers')
				.select('a')
				.attr('target', '_blank')
				.attr('href', urlVersCyberlibris(d.iid, d.iid, 'en'));
		});

	// TEXT NODES
	textnode = svg
		.select(".alltextnodes")
		.selectAll(".nodetext")
		.data(visnodes, function(d){ return `iid${d.iid}`; });

	textnode.exit().remove();

	textnodeupd = textnode
		.enter()
		.append("text")
		.attr('class', "nodetext")
		.merge(textnode)
		.attr('text-anchor', "middle")
		.style('font-size', fontsize)
		.style("opacity", labelopacity_off)
		.style("pointer-events", "none")
		.text(function(d) { return referenceIntitutions[d.iid].name });

	// PARAM FILTER LINK VALUE
	d3
		.select("#paramlinklabel")
		.text(linkvalue);
	
	if (searchlinkvalue == false){
	// Si le changement provient du slider, on n'efface pas la barre actuelle
		d3
			.select("#paramlinkvalue")
			.attr('min', String(minlinkvalue))
			.attr('max', String(maxlinkvalue))
			.attr('value', String(linkvalue))
			.attr('step', 1)
			.on("input", function() {
				linkvalue = +this.value;
				// Update the label
				d3
					.select("#paramlinklabel")
					.text(linkvalue);

				aggregatedfilter(false);
			});			
	} else {
	// Si le changement ne provient pas du slider, on re-crée le slider pour qu'il se repositionne bien au centre  	
		d3
			.select("#paramlinkvalue")
			.remove();
		d3
			.select('#sliderlinkvalue')
			.append('input')
			.attr('id', 'paramlinkvalue')
			.attr('type', 'range')
			.attr('min', String(minlinkvalue))
			.attr('max', String(maxlinkvalue))
			.attr('value', String(linkvalue))
			.attr('step', 1)
			.on("input", function() {
				linkvalue = +this.value;
				// Update the label
				d3
					.select("#paramlinklabel")
					.text(linkvalue);

				aggregatedfilter(false);
			});		
	};

	function coveronmouseover(docid) {
		let greennodes = visnodes
			.filter(function(d){ return d.docid.includes(docid); })
			.map(function(d){ return d.iid; });
		d3
			.selectAll('.onenode')
			.attr("fill", 'red' );
		d3
			.selectAll('.onenode')
			.filter(function(d){ return greennodes.includes(d.iid); })
			.attr("fill", 'green' );
	};

	function coveronmouseout () {
		d3
			.selectAll('.onenode')
			.attr("fill", function(d) { return color(d.iid); });
	};

	// RUN THE FORCES
	simulation
		.nodes(visnodes)
		.on("tick", ticked);

	simulation
		.force("link")
		.links(vislinks);

	simulation.nodes(visnodes).alpha(0.5).restart();

	$(window).on('resize', function(){ simulation.nodes(visnodes).alpha(0.5).restart(); });
};

function urlVersCyberlibris (first, last, lang){
	return `${baseurl}first=${first}&last=${last}&lang=${lang}
	&publisherid=${(publivalue == allpublisherskeyword)?'':publivalue}
	&niveau2=${(niveau2value == allniveau2keywords)?'':niveau2value}
	&niveau1=${(niveau1value == allniveau1keywords)?'':niveau1value}
	&db=${param.db}`;
	//return baseurl + 'first=' + first + '&last=' + last + '&lang=' + lang + '&publisherid=' + publisherid + '&classid=' + classid + '&decitre=' + decitreid;
};

function ticked() {
	//console.log(simulation.alpha());
	var radius = nodesradiusrange[1];
	var localwidth = parseInt(d3.select('.svggraph').style('width'), 10);
	var localheight = parseInt(d3.select('.svggraph').style('height'), 10);

	function xlim (a) { return Math.max(radius, Math.min(localwidth - radius, a)); };
	function ylim(b) { return Math.max(radius, Math.min(localheight - radius, b)); };
	
	//console.log(simulation.alpha());
	groupnodeupd
		.attr("cx", function(d) { return xlim(d.x); })
		.attr("cy", function(d) { return ylim(d.y); });

	textnodeupd
		.attr("dx", function(d){ return xlim(d.x); })
		.attr("dy", function(d){ return ylim(d.y + nodescale(d.docid.length)); });

	linkupd
		.attr("x1", function(d) { return xlim(d.source.x); })
		.attr("y1", function(d) { return ylim(d.source.y); })
		.attr("x2", function(d) { return xlim(d.target.x); })
		.attr("y2", function(d) { return ylim(d.target.y); });
};

function getcovers(){
	$.getJSON(datacolorassocapiurl, function(res){
		res.docid.map(function(d, i){
			bookscovers[d] = res.coverimg[i];
		});
		console.log('covers downloaded');
	});
};

function zoomed(){
	idle = 0;
	svg.attr("transform", d3.event.transform);
};

function dragstarted(d) {	
	//if (!d3.event.active) 
	simulation.alphaTarget(0.3).restart();
	d.fx = d.x;
	d.fy = d.y;
};

function dragged(d) {
	d.fx = d3.event.x;
	d.fy = d3.event.y;
};

function dragended(d) {
	//if (!d3.event.active) 	
	simulation.alphaTarget(0);
	//d.fx = null;
	//d.fy = null;
};