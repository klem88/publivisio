(function(){

	var tpl=null;
	var buttonName = 'btn-filter-';
	var ativeItemName = 'active-filter-';
	
	var dataprovider = function(groupename,filters,callback){

		return;
	};

	function show_filter_list(evt) 	
	{
		console.log('show_filter_list');

		var url = $(this).attr('data-url') + getParamsURL();
		var name = $(this).attr('data-name');
		var title = $(this).attr('data-title');
		var idfield = $(this).attr('data-idfield');
		var namefield = $(this).attr('data-namefield');
		var activeitem = ativeItemName + name;

		dataprovider(name,[],(data) => {
			if (data)
			{
				console.log(data);

				var thelist = [];

				$.each(data,function(idx,item){
					thelist.push({id:item[idfield],name:item[namefield],count:item['cnt']});
				});

	    		$('#dlg-filter-list').html(Mustache.render(tpl,{list:thelist}));
				$('#dlg-filter-list').css({top:'10%'}).dialog('option','title',title.substring(0,25)).dialog('open');
				$('#dlg-filter-list .filter_item').bind('click',function(){
					var itemid = $(this).attr('data-item');
					var itemname = $(this).attr('data-name');
					$('#' + activeitem).html(itemname)
						.attr('data-item',itemid)
						.attr('data-name',itemname)
						.on('click',function(evt){
							evt.preventDefault();
							$(document).trigger('filter_removed',[name,itemid]);
							$(this).off(evt).hide();
						})
						.show();
					;
					$(document).trigger('filter_selected',[name,itemid]);
					$('#dlg-filter-list').dialog('close');
				});

			}

		});
		


		return false;
	}

	function setup_filters() 
	{
		$.each(filters,function(idx,item){
//			if (item.button) {
			$('#' + buttonName + item.name).bind('click',show_filter_list)
			.attr('data-url',item.url)
			.attr('data-name',item.name)
			.attr('data-title',item.title)
			.attr('data-idfield',item.idfield)
			.attr('data-namefield',item.namefield)
			.attr('data-activeitem',ativeItemName + item.name)
			;
//			}
		});
	}
	function init_filters_from_url_params()
	{
		var allVars = $.getUrlVars();
		for (var k in allVars)
		{
			if (k != 'sort') {
				get_filters_name(k,allVars[k]);	
			}
		}
	}
	function get_filters_name(k,itemid)
	{
		$.ajax({
			url : '/catalog/metafilters/getnamefromid/'+k+'/'+itemid,
			success : function(data) {
				if (data) {
					var activeitem = ativeItemName + k;
					var itemname = data;
					$('#' + activeitem).html(itemname)
					.attr('data-item',itemid)
					.attr('data-name',itemname)
					.on('click',function(evt){
						evt.preventDefault();
						$(document).trigger('filter_removed',[name,itemid]);
						$(this).off(evt).hide();
					})
					.show();
				}
			}
		});
	}

	function load_tpl() {
		tpl = $('#tpl-filter-list').html();
		console.log('tpl loaded');
	}

	function initialize(options) {
		$("#dlg-filter-list").dialog({
			modal : true,
			autoOpen : false,
			width : 600,
			maxWidth : 600,
			maxHeight : 500,
			dialogClass : 'no-close success-dialog',
		});
		if (options.filters) {
			filters = options.filters;
		}
		if (options.dataprovider)
		{
			dataprovider = options.dataprovider;
		}
		load_tpl();
		setup_filters();
		init_filters_from_url_params();
	}

	BKSFilters = window.BKSFilters || {};
	BKSFilters.initialize = initialize;

}).call(this);