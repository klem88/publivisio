(function(){
	function dothemagicdance(evt) {
	    var w=$(window).width();
	    var h=$(window).height();

	    //console.log('dance ' + w + 'x' + h);
	    if (w > 0) //800
	    {
	        $('body').removeClass('smallSize');
	    }
	    else if (w < 800)
	    {
	        $('body').addClass('smallSize');
	    }
	}
	$(document).ready(function(){
		// console.log('ready');
	    $(window).on('resize',dothemagicdance);
	    dothemagicdance();
	});
	
}).call(this);