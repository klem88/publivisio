(function(){
	var books;
	var datafile = '/layouts/catalog/scope.json';

	function initdb(reset) {
		db = new loki('scope.db');
		books = db.addCollection('books',['source']);
	}


	function initialize() {
		initdb();
	}

	function load_data() {
		$.ajax({
			dataType:'json',
			url: datafile,
			success: (data) => {
				if (data) {
					books.insert(data);
					// console.log(books);
					$(document).trigger('scope_ready');
				}
			}
		})
	}

	this.Scope = window.Scope || {
		ready: (callback) => {
			$(document).on('scope_ready',callback);

			initdb();
			load_data();
		},

		getTree: (callback,source) => {
			var sort = 'weight';
			var view = books.chain().find();

			view.where((obj)=>{
				return obj.source == source;
			});

			view.simplesort(sort,true);

			callback(view.data());
		} 

	} 	
	
}).call(this);

(function(){

    var sortfield = 'pubdate',
        offset=0,
        limit=30,
        total=0,
        MAX_PER_ROW=3,
        MAX_IMPORT=100;

    var LANGUAGES= {
            en: 'Anglais',
            fr: 'Français',
            pt: 'Portugais',
            ge: 'Allemand',
            es: 'Espagnol'
        };

    var DOCTYPES = [
        {"typename": "Revue", "id": 2, "typenameen": "Journal", "typenamefr": "Revue"},
        {"typename": "Video", "id": 3, "typenameen": "Video", "typenamefr": "Video"},
        {"typename": "Sound", "id": 4, "typenameen": "Sound", "typenamefr": "Sound"},
        {"typename": "Roman", "id": 5, "typenameen": "Novel", "typenamefr": "Roman"},
        {"typename": "Document", "id": 6, "typenameen": "Document", "typenamefr": "Document"},
        {"typename": "Recueil", "id": 7, "typenameen": "Collection", "typenamefr": "Recueil"},
        {"typename": "Guide", "id": 8, "typenameen": "Guide", "typenamefr": "Guide"},
        {"typename": "Dictionnaire", "id": 9, "typenameen": "Dictionary", "typenamefr": "Dictionnaire"},
        {"typename": "Album", "id": 10, "typenameen": "Children\'s book", "typenamefr": "Album"},
        {"typename": "Manuel", "id": 11, "typenameen": "Textbook", "typenamefr": "Manuel"},
        {"typename": "Beau Livre", "id": 12, "typenameen": "Art book", "typenamefr": "Beau Livre"},
        {"typename": "Essai", "id": 13, "typenameen": "Essay", "typenamefr": "Essai"},
        {"typename": "Th\u00e8se", "id": 14, "typenameen": "Thesis", "typenamefr": "Th\u00e8se"},
        {"typename": "Pi\u00e8ce", "id": 15, "typenameen": "Play", "typenamefr": "Pi\u00e8ce"},
        {"typename": "Monographie", "id": 16, "typenameen": "Monography", "typenamefr": "Monographie"},
        {"typename": "Biographie", "id": 17, "typenameen": "Biography", "typenamefr": "Biographie"},
        {"typename": "BD", "id": 18, "typenameen": "Comics", "typenamefr": "BD"},
        {"typename": "R\u00e9cit", "id": 19, "typenameen": "Account", "typenamefr": "R\u00e9cit"},
        {"typename": "Fiche de lecture", "id": 20, "typenameen": "Book summary", "typenamefr": "Fiche de lecture"}
        ];

    var processing = false;
    var templates = {
        list: { tpl: 'tpl-results-list', image: 'images/switchToList.png' },
        diapo: { tpl: 'tpl-results-list-diapo', image: 'images/switchToDiapo.png' },
        filter: { tpl: 'tpl-filter-list'}
    };


    var FILTERS_SPECS = [
        {
            name:'publisher',
            title: 'Editeurs',
            idfield:'publisherid',
            namefield:'publishername',
        },
        {
            name:'lang',
            title: 'Langue',
            idfield:'lang',
            namefield:'label',
        },
        {
            name:'doctype',
            title: 'Type de document',
            idfield:'doctypeid',
            namefield:'doctypename',
        },
        {
            name:'pubdate',
            title: 'Date de publication',
            idfield:'pubdate',
            namefield:'pubdate',
        },
    ];

    var viewmode='list';
    var current_tpl = 'tpl-results-list';
    
    var args,firstid,lastid,filters,source;

    var prefs = {viewmode:viewmode};

    var facets = {};

    var facets_fields = ['lang','publisherid','doctypeid','pubdate'];

    var publishers = null;


    var g_publishers = [];
    var g_dataset = null, totalitems = 0;


    var current_specs=null;
    var dlglogin, dlgfolders;


    function loadPrefs()
    {
        var cachekey = 'catprefs';
        return cache_get(cachekey) || prefs;
    }
    
    function savePrefs(settings)
    {
        var cachekey = 'catprefs';
        return cache_set(cachekey,settings,3600);
    }

    function setupUI() {
        $('#btn-switch-mode').on('click',(evt) => {            
            var mode = $('#btn-switch-mode').attr('data-item');
            switchView(mode);
            if (mode === 'list')
            {
                mode = 'diapo';
            }
            else
                mode = 'list';

            $('#btn-switch-mode').attr('data-item',mode);
            $('#btn-switch-mode img').attr('src',(templates[mode]).image);

        });

        var settings = loadPrefs();
        viewmode = settings.viewmode;
        current_tpl = (templates[viewmode]).tpl

        var switchmode = viewmode;
        if (viewmode === 'list')
        {
            switchmode = 'diapo';
        }
        else
            switchmode = 'list';

        $('#btn-switch-mode').attr('data-item',switchmode);
        $('#btn-switch-mode img').attr('src',(templates[switchmode]).image);

        $('.sortfields').on('click',(evt) => {
            var elt = evt.target;

            $('.sortfields').removeClass('active');
            $(elt).addClass('active');

            var field = $(elt).attr('data-item');
            console.log(field);
            sortfield = field;
            
            show_data(true);

            return false;
        });

        // $('.filter_item').on('click',(evt) => {
        //     var elt = evt.target;
        //     var specs = {

        //         field : $(elt).attr('data-idfield'),
        //         label : $(elt).attr('data-name'),
        //         title : $(elt).attr('data-title'),
        //     };

        //     var items = format_facets(field);

        //     console.log(specs);
        // });

        BKSFilters.initialize({
            filters:FILTERS_SPECS,
            dataprovider: getFacets
        });

    }

    function getFacets(groupname,filters,callback)
    {
        console.log(groupname,filters);

        var l_facets = [];

        if (groupname == 'publisher')
        {

            l_facets = _.map(facets.publisherid,(e) => {
                var t = _.filter(g_publishers,(ap)=> { 
                    return ap.publisherid == e.key;
                });
                // console.log(t);
                var p = t.pop();
                // console.log(p);
                return {
                    publisherid:p.publisherid,
                    publishername:p.publishername,
                    cnt: e.value
                };
            });

        }
        else if (groupname == 'lang')
        {
            l_facets = _.map(facets.lang,(e) => {
                // console.log(e);
                return {
                    lang: e.key,
                    label: LANGUAGES[e.key],
                    cnt: e.value                    
                };
            });
        }
        else if (groupname == 'doctype')
        {
            l_facets = _.map(facets.doctypeid,(e) => {
                var t = _.filter(DOCTYPES,(ap)=> { 
                    return ap.id == e.key;
                });
                var d = t.pop()
                return {
                    doctypeid: e.key,
                    doctypename: d.typename,
                    cnt: e.value
                };
            });
        }
        else if (groupname == 'pubdate')
        {
            l_facets = _.map(facets.pubdate,(e) => {
                var t = e.key
                if (t == null || t.length == '')
                    t = '1900';
                return {
                    pubdate: t,
                    pubdate: t,
                    cnt: e.value                    
                };
            });
        }

        callback(l_facets);
    }


    // function format_facets(field)
    // {
    //     var items=[];
    //     var db = null;
    //     if (field == 'publisherid')
    //     {

    //     }

    // }


    // function showFacets() 
    // {
    //     if (keyname == 'publisherid')
    //     {
            
    //     }
    // }

    function switchView(mode)
    {
        if (templates[mode] !== undefined)
        {
            viewmode = mode;
            current_tpl = (templates[mode]).tpl;

            show_data(true);

            var settings = loadPrefs();
            settings.viewmode = mode;

            savePrefs(settings);
        }
    }

    function show_data(refresh) 
    {
        var data_tree = [];

        if (refresh)
        {
            $('#results').empty();
            offset=0;
        }
        var tplresults = $('#' + current_tpl).html();
        
        function render_book(b) {
            $('#results').append(Mustache.render(tplresults, {list:[b]}));
        }

        function render_books(dataset)
        {
            itemIdx=0;
            idx = 0;

            total = dataset.total;
            console.log('dataset.offset',dataset.offset);
            console.log('dataset.items',dataset.items);


            facets = dataset.facets || {};

            var l_items = _.map(dataset.items,(item)=>{
                item.weight=0; 
                if (item.docid == parseInt(source))
                {
                    item.weight = 1;
                }
                else
                {
                    var ps = {source:parseInt(source),target:item.docid};
                    var t =  _.findWhere(data_tree,ps);
                    item.weight = t.weight;
                    // console.log(t);
                }
                return item;
            });

            var s_items = _.sortBy(l_items,(item)=>{ 
                return -item.weight;
            });
            console.log('s_items',s_items);

            $('#totalcount').html(dataset.total);
            $('#results').append(Mustache.render(tplresults, 
                {
                    // list:dataset.items,
                    list:s_items,
                    needsep: () => {
                        return (++idx % 3 == 0);
                    },
                    itemIndex: () => { return ++itemIdx; },
                    remoteHost:"univ.scholarvox.com",                    
                }));

            $('#results .item').first().removeClass('firstScope').addClass('firstScope');
            
            processing = false;
        }


        Scope.getTree((data) => {
            data_tree = data;
            console.log(data);
            var items = _.map(data,(item) => { return item.target; });
            items.push(parseInt(source));
            
            console.log(items);

            console.log('filters',filters);

            var l_filters = {docid:items};
            _.each(Object.keys(filters),(k)=>{ l_filters[k]=filters[k];});

            console.log('l_filters',l_filters);

            current_specs = {
                dataloader: (params) => {
                    Catalog.getBooks2(params.callback,params.pagesize,params.offset,params.sortfieldn,params.withmeta,params.facets_fields,params.filters);
                },
                params: {
                    callback: render_books,
                    pagesize: (data.lengh + 1),
                    offset:offset,
                    sortfield:sortfield,
                    withmeta:true,
                    facets_fields:facets_fields,
                    filters: l_filters
                }

            };

            // Catalog.getBooks2(render_books,data.length + 1,offset,sortfield,true,facets_fields,l_filters);
            current_specs.dataloader(current_specs.params);
            
        },source);

    }


    function onFilterSelected(evt,filter_name,filter_id)
    {
        // console.log('onFilterSelected',filter_name,filter_id);
        var current = _.filter(FILTERS_SPECS,(e) => { return e.name == filter_name; }).pop();
        // console.log('current',current);

        filters[current.idfield] = filter_id;

        show_data(true);
    }
    
    function onFilterRemoved(evt,filter_name,filter_id)
    {
        // console.log('onFilterRemoved',filter_name,filter_id);
        var current = _.filter(FILTERS_SPECS,(e) => { return e.name == filter_name; }).pop();

        var n_filters = _.omit(filters,current.idfield);

        filters = n_filters;

        show_data(true);
    }

    function show_login() {
        dlglogin.dialog('open');

        return false;
    }

    function do_login(evt) 
    {
        evt.preventDefault();

        var rx_empty=/^[ \t]*$/;
        var username = $('#username').val();
        var pwd = $('#password').val();

        if (!username.match(rx_empty) && !pwd.match(rx_empty))
        {
            BookshelfMgr.login(username,pwd,()=>{
                dlglogin.dialog('close');
                $(document).trigger('onLoginSuccess');
                
            });
        }
    }

    function create_folder(foldername,callback)
    {
        BookshelfMgr.create_folder(foldername,callback);
    }

    function select_folder()
    {
    	$('#foldername').val('');
        dlgfolders.dialog('open');
    }

    function save_list(evt)
    {
        evt.preventDefault();

        var folderid = parseInt($('#folders-list').val());
        console.log(folderid);

        function dataset_handler(dataset) {
            
            console.log(dataset.total);

            var books = _.map(dataset.items,(item) => { return item.docid; });
            BookshelfMgr.addBooks(folderid,books,(data)=>{
                console.log(data);
            });

        }

        function do_import() {
            var tparams = current_specs.params;
            tparams.limit = Math.min(MAX_IMPORT, totalitems);
            tparams.callback= dataset_handler;

            current_specs.dataloader(tparams);
	
			notify("Liste en cours d'importation",'success');

	        dlgfolders.dialog('close');
        }

        if (folderid > 0)
        {
        	do_import();
        }
        else
        {
        	var fname = $('#foldername').val();

        	if (fname.length > 0)
        	{
	        	console.log('will create folder ' + fname);

        		BookshelfMgr.createFolder(fname,(data)=>{
        			folderid = data.folderid;
        			do_import();
        		});
        	}
        }


    }

    function refresh_folders() {
        BookshelfMgr.folders((items)=>{
            $('#folders-list').empty().append('<option value="0">[Select.]</option>');
            $.each(items,(idx,item)=>{
                $('#folders-list').append('<option value="' + item.id + '">' + item.name + '</option>');
            });
        });
    }

    function add_to_bookshelf(evt) {

        evt.preventDefault();

        if (!BookshelfMgr.isAuthenticated()) {
            show_login();
        }
        else
        {
            $(document).trigger('onLoginSuccess');
            // dlgfolders.dialog('open');       
        }
    }



    $(document).ready(() => {
        BookshelfMgr.initialize({
            base_endpoint: 'https://www.lilliadvis.io/bookshelfmgr'
        });

        $('#btn-folders').on('click', add_to_bookshelf);

        dlglogin = $('#pnl-login').dialog({
            autoOpen: false,
            modal: true
        });
        $('#btn-cancel').on('click',(evt)=>{ 
            evt.preventDefault();
            dlglogin.dialog('close');
        });
        $('#btn-login').on('click',do_login);
        $('#form-login').on('submit',do_login);

        dlgfolders = $('#folder-selector').dialog({
            autoOpen: false,
            modal: true
        });
        $('#btn-folder-save').on('click',save_list);
        $('#btn-folder-cancel').on('click',(evt)=>{ 
            evt.preventDefault();
            dlgfolders.dialog('close');
        });

        $(document).bind('onLoginSuccess',(evt)=>{
            refresh_folders();
            select_folder();
        });



        setupUI();


        Catalog.set_datafile('scope_data.json');
        
        Catalog.ready(() => {
            var args = uriParse(location.href);

            console.log(args);

            source = args.source || null;


            filters={};
            Catalog.Publishers((data)=> {
                g_publishers = data.items;
            });

            $(document).bind('filter_selected',onFilterSelected);
            $(document).bind('filter_removed',onFilterRemoved);

            $(window).scroll(() => {

                var w_top = $(window).scrollTop();
                var d_h = $(document).height();
                var w_h = $(window).height();
                var f_h = 0; //$('#footer').height() + 100;

                var m = d_h - w_h - f_h - 500;
                if( w_top >= m )
                {

                    var pagecount = parseInt(total / limit) + ((total % limit)?1:0);
                    var page =  parseInt(offset/limit) + 1;

                    console.log(page,pagecount);

                    if (page < pagecount) {
                        page += 1;
                        offset = (page - 1) * limit;
                        console.log(page,offset);

                        if (!processing)
                        {
                            processing = true;
                            show_data();
                        }
                    }
                }
            });

            if (source != null)
            {
                Scope.ready(()=>{

                    show_data();
                });
            }
            // show_data()
        });

    });

}).call(this);