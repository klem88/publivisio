function Buffer(handler) {
    var queue = [];

    function run() {
        var callback = function () {
             if (queue.length > 0) {
                  run();
             }
        }
        handler(queue.shift(), callback);
    } 
    this.append = function(task) {
        queue.push(task);
        if (queue.length === 1) {
            run();
        }
    }

}

function Task(item, url, callback) {
    this.item = item;
    this.url = url;
    this.callback = callback
}

function taskHandler(task, callback) {
    $(task.item).load(task.url, function() {
        if (task.callback) task.callback();
        callback();
    });
}


var smart_classes=['riri','fifi','loulou','donald'];

function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}
function trim (input) {
    return input.replace(/^\s+|\s+$/g, "");
}

var rxempty=/^[ \t]*$/;


function hide_panel(evt)
{
    $('#' + $(this).attr('data-item')).hide();
    return false;
}

function notify(msg, type)
{
    var n = noty({
    	theme:'relax',
    	text:msg,
    	type:type,
    	open: 'fadeInUp',
    	close: 'fadeOutDown',
    	timeout:1000,
    });

}

function bk_confirm(msg,yes_callbak,no_callbak)
{
    var n = noty({
    	theme:'relax',
    	type:'warning',
    	modal:true,
    	text:msg,
    	buttons: [
    		{
    			addClass: 'btn btn-primary', 
    			text: translations.button_yes, 
    			onClick: function() {
    				n.close();
    				yes_callbak();
    			}
    		},
    		{
    			addClass: 'btn btn-danger', 
    			text: translations.button_cancel,
    			onClick: function(){
    				n.close();
    				no_callbak();
    			}
    		}
    	]
    });
}

var CACHE_PREFIX='DICEVX_';
var CACHE_TIMEOUT=600;

function cache_get(key)
{
    	var cache = localStorage || {};
    	var retval = null;
    	var realkey = CACHE_PREFIX + key;
    	if (cache[realkey] != undefined) {
    		var data = JSON.parse(cache[realkey]);
    		var expires = parseInt(data.expires);
    		if (expires < new Date().getTime())
    		{
    			cache.removeItem(realkey);
    		}
    		else {
    			retval = data.value;
    		}
    	}
    	return retval;
}

function cache_set(key,value,timeout) {
    var cache = localStorage || {};
    
    if (timeout == undefined)
    	timeout = CACHE_TIMEOUT;

    var data = {
    	value: value,
    	expires: new Date().getTime() + timeout * 1000
    }
    cache[CACHE_PREFIX + key]= JSON.stringify(data);
}

function uriReplace(uri, key, value)
{
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    } else {
        return uri + separator + key + "=" + value;
    }
}

function uriParse(uri) {
    var queryString = {};   
    uri.replace(
        new RegExp("([^?=&]+)(=([^&/]*))?", "g"),
            function($0, $1, $2, $3) { queryString[$1] = $3; }
    );
    return queryString;
}


var globalFilters={};

function getParamsURL()
{
    var params = [];
    var urlParams = '';

    $.each(Object.keys(globalFilters),function(idx,k){
        if (globalFilters[k] != null)
        {
            params.push(k + '=' + globalFilters[k]);
        }
    });

    var searchType = $('input:radio[name=group-searchtype]:checked').val();

    if (typeof searchType !== 'undefined') {
        params.push('searchtype=' + searchType);
    }

    if (params.length > 0)
    {
        urlParams += '?' + params.join('&');
    }
    return urlParams;
}

function updateQueryStringParameter(uri, key, value)
{
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    } else {
        return uri + separator + key + "=" + value;
    }
}


$.extend({
    getUrlVars : function() {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        if (window.location.href.indexOf('?') >= 0)
        {
            for (var i = 0; i < hashes.length; i++) {
                hash = hashes[i].split('=');
                vars[hash[0]] = hash[1];
            }
        }
        return vars;
    },
    getUrlVar : function(name) {
        return $.getUrlVars()[name];
    }
});

//Addition from Clément to put the URL params into a global var without interfering with the existing code
var param = {}
location.search.substr(1).split("&").forEach(
    function(item){
        param[item.split("=")[0]] = item.split("=")[1];
    }
);
// RETURN BUTTON
$('#returnhref').attr('href', `../boussole/index.html?db=${param.db}&lang=${param.lang}`);
console.log(param)