$(document).ready(function(){
    $('.exploreClic').click(function(){
        if ($('.exploreSubNav').attr('class') == 'exploreSubNav hidden'){
            $('.exploreSubNav').removeClass('hidden');}
        else{
            $('.exploreSubNav').addClass('hidden');
        }
    });
});

$(document).ready(function(){
    $('.close').click(function(){
        $('.exploreSubNav').addClass('hidden');
        $('.navBox').addClass('hidden');
    });
});

$(document).ready(function(){
    $('.exploreSubNav').click(function(){
        $('.exploreSubNav').addClass('hidden');
    });
});

$(document).ready(function(){
    $('#ableOn').click(function(){
        $('.navBox').removeClass('hidden');
    });
});
