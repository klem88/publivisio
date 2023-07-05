(function(){

	var db,books,igraph,schools,publishers,thesaurus;
	var datafile = `data/${param.db}catalogdata.json`;

	function initdb(reset) {
		console.log('initdb');

		db = new loki('catalog.db');

		books = db.addCollection('books',['docid']);
		igraph = db.addCollection('igraph',['iid']);
		schools = db.addCollection('schools',['id']);
		publishers = db.addCollection('publishers',['publisherid']);
		//thesaurus = db.addCollection('thesaurus',['code1']);
	}

	function initialize(options) {
		if (options.datafile)
		{
			datafile = options.datafile;
		}
		initdb();
	}

	function load_data() {

		$.ajax({
			dataType:'json',
			url:datafile,
			success: (data) => {
				if (data) {
					
					books.insert(data.books);

					try 
					{
						igraph.insert(data.igraph);
					}
					catch(e)
					{
						console.log(e);
					}
					

					schools.insert(data.schools);
					//thesaurus.insert(data.thesaurus);
					publishers.insert(data.publishers);
					
					param.sourcename = data.schools.filter((d)=>{ return d.iid == param.first})[0].name;
					param.targetname = (param.first != param.last) ? data.schools.filter((d)=>{ return d.iid == param.last})[0].name : '';
					param.publishername = (param.publisherid != '') ? data.publishers.filter((d)=>{ return d.publisherid == param.publisherid})[0].publishername : '-';
					param.niveau1name = (param.niveau1 != '') ? data.niveau1.filter((d)=>{ return d.niveau1 == param.niveau1})[0].name : '-';
					param.niveau2name = (param.niveau2 != '') ? data.niveau2.filter((d)=>{ return d.niveau2 == param.niveau2})[0].name : '-';

					$(document).trigger('catalog_ready');

					$('#schools').text(`${param.sourcename} ${param.targetname}`);
					$('#selpublisher').text(`${param.publishername}`);
					$('#selniveau1').text(`${param.niveau1name}`);
					$('#selniveau2').text(`${param.niveau2name}`);					
				}
			}
		})

	}

	this.Catalog = window.Catalog || {

		datafile: datafile,

		set_datafile: (filepath) => {
			datafile = filepath;
		},

		ready: (callback) => {
			$(document).on('catalog_ready',callback);

			initdb();
			load_data();
		},

		getViewData: (view, filters,sortby,isdesc,callback, limit, offset, withmeta,facets_fields) => {
			var pagesize = limit || 10;
			var pagestart = offset || 0;

			// console.log('filters',filters);

			_.each(_.keys(filters),(k) => { 
				view.where((obj)=> {
					if (Array.isArray(filters[k])) {
						return (filters[k]).indexOf(obj[k]) > -1;
					}
					else {
						return obj[k] == filters[k];
					}
				});
			});
			
			view.simplesort(sortby,isdesc);

			var facets = {};
			var prefix = 'f_';

			var fields = facets_fields || [];
			_.each(fields,(field) => {
				var fgroup={};
				_.each(view.data(), (e) => {
					var key = prefix + e[field];
					fgroup[key] = (fgroup[key] || 0) + 1;
				});
				// facets[field] = fgroup;
				facets[field] = _.map(fgroup,(v,k) => {
					return { key:k.replace(prefix,''), value: v };
				});
			});

			console.log('facets', facets);

			var items = view.data().slice(pagestart, pagestart + pagesize);

			if (withmeta) 
			{
				return callback({ total: view.count(), items: items, offset:pagestart,limit:pagesize,facets:facets});
			}
			$.each(view.data().slice(pagestart, pagestart + pagesize),(idx,item) => { callback(item); }); 
		},

		getBooks: (callback,limit,offset,sort,withmeta,facets_fields) => {
			// var  m = maxsize || 10;
			var s = sort || 'title';
			console.log(s);
			console.log(callback);
			Catalog.getViewData(books.chain().find(),[],s,true,callback,limit,offset,withmeta,facets_fields);			

		},

		getBooks2: (callback,limit,offset,sort,withmeta,facets_fields,filters) => {
			var s = sort || 'title';
			console.log(s);
			console.log(callback);
			Catalog.getViewData(books.chain().find(),filters,s,true,callback,limit,offset,withmeta,facets_fields);			
		},

		BookshelvesIntersect: (options) => {

			console.log(options);

			var firstid = options.firstid,
				lastid = options.lastid,
				callback = options.callback,
				limit = options.limit,
				offset = options.offset,
				sort = options.sortfield || 'pubdate',
				withmeta = options.withmeta,
				filters = options.filters,
				facets = options.facets;
				;

			var fd = [], ld=[];
			
			var sortby = 'pubdate';
			if (options.sort !== undefined)
				sort = options.sort;

			if (sort !== undefined ) 
				sortby = sort;

			if (sortby === 'author')
				sortby = 'contributor1';
			
			var isdesc = (sortby === 'pubdate');
			console.log('sort',sort);
			console.log('sortby',sortby);
			console.log('isdesc',isdesc);

			$.each(igraph.chain().find({iid:{ $eq:firstid}}).data(),
				(idx,item) => { fd.push(item.docid)});
			$.each(igraph.chain().find({iid: {$eq:lastid}}).data(),
				(idx,item) => { ld.push(item.docid)});

			var inter = _.intersection(fd,ld);

			var params = {docid:{$in:inter}};
			var myview = books.chain().find(params);

			Catalog.getViewData(myview,filters,sortby,isdesc,callback,limit,offset,withmeta,facets);			
		},

		Schools: (callback) => {
			Catalog.getViewData(schools.chain().find(),{},'name',false,callback,2000,0,true);
		},

		Publishers: (callback) => {
			Catalog.getViewData(publishers.chain().find(),{},'publishername',false,callback,2000,0,true);
		},

		Thesaurus: (callback) => {
			Catalog.getViewData(publishers.chain().find(),{},'code1',false,callback,2000,0,true);
		}

	};

	
}).call(this);