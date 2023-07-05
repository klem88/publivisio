(function(){

	var db;

	function initdb(reset) {
		db = new zango.Db('catalog', 
			{ 
				books: ['docid'],
				igraph: { iid: true, docid: true },
			});

		var books = db.collection('books');
		var igraph = db.collection('igraph');

	}
	
	function Add(thelist,callback) {
		var books = db.collection('books');
		books.insert(thelist).then(callback);
	}

	function load_graph(jsonfile) {
		$.ajax({
			dataType:'json',
			url:jsonfile,
			success: (data) => {
				if (data) {
					console.log(data.nodes.length);
					var g = db.collection('igraph');
					g.insert(data.nodes, (error)=>{ console.log(error);}).then(
						() => {
							console.log(jsonfile + ' loaded');
						}
					);
				}
			}
		})
	}

	function initialize() {
		initdb();
	}

	this.Catalog = window.Catalog || {
		initialize:initialize,
		
		reset: () => {
			db = new zango.Db('catalog');
			db.drop((error) => { if (error) throw error; });
			// window.indexedDb.deleteDatabase('catalog');
			initdb();
		},
		loadGraph: load_graph,
		loadBooks: (jsonfile) => {
			$.ajax({
				dataType:'json',
				url:jsonfile,
				success: (data) => {
					if (data) {
						// console.log(data.books.length);
						// console.log(data.books[0]);
						
						var g = db.collection('books');
						g.insert(data.books, (error)=>{ console.log(error)}).then(
							() => {
								console.log(jsonfile + ' loaded');
							}
						);
					}
				}
			});

		},
		getBooks: (maxsize,sort,callback) => {
			var  m = maxsize || 10;
			var s = sort || 'title';

			var books = db.collection('books');
			books.find().limit(m).forEach((doc) => { callback(doc)});
		},
		walk: () => {
			var g = db.collection('igraph');
			g.find().limit(10).forEach((doc)=>{ console.log(doc.id); });
		},
		BookshelvesIntersect: (firstid,lastid,callback) => {
			var g = db.collection('igraph');

			var fd = [], ld=[];

			g.find({iid:firstid}).forEach((doc) => { 
				fd.push(doc.docid);
			}).then(() => {
				g.find({iid:lastid}).forEach((doc) => {
					ld.push(doc.docid);
				}).then(() => { 
					callback(ld.filter((n) => {
					 	return fd.indexOf(n) !== 1;
					}));
				})
			});


		},
		test: () => {
			Catalog.reset();

			var bfile = '/layouts/catalog/books.json';
			Catalog.loadBooks(bfile);
			Catalog.getBooks(10,'title',(doc) => {
				console.log(doc);
			});

			var gfile='/layouts/catalog/graph.json';
			Catalog.loadGraph(gfile);
			Catalog.BookshelvesIntersect(515,5,(doc)=>{console.log(doc)});
		}
	};

	
}).call(this);