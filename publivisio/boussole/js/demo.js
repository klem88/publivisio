
/* $(document).ready(function(){
    $('.expandButton').click(function(){
        alert('paf');
        $('.dataviewer').addClass('opened');
    });
}); */

$(document).ready(function(){
    $('.expandButton').click(function(){
        if ($('.dataviewer').attr('class') == 'dataviewer opened'){
            $('.dataviewer').removeClass('opened');}
        else{
            $('.dataviewer').addClass('opened');
        }
    });
});

$(document).ready(function(){
    $('#switchButton').click(function(){
        if ($('#switchButton').attr('class') == 'switchButton dayNote'){
            $('#switchButton').removeClass('dayNote');
            $('#switchButton').addClass('nightNote');
            $('body').removeClass('day');
            $('body').addClass('night');}
        else{
            $('#switchButton').removeClass('nightNote');
            $('#switchButton').addClass('dayNote');
            $('body').removeClass('night');
            $('body').addClass('day');}
    });
});

$(document).ready(function(){
    $('.bottomViewer').click(function(){
        if ($('.bottomViewer').attr('class') == 'bottomViewer hidden'){
            $('.bottomViewer').removeClass('hidden');}
        else{
            $('.bottomViewer').addClass('hidden');
        }
    });
});

$(document).ready(function(){
    $('close').click(function(){
        if ($('.bottomViewer').attr('class') == 'bottomViewer hidden'){
            $('.bottomViewer').removeClass('hidden');}
        else{
            $('.bottomViewer').addClass('hidden');
        }
    });
});

$(document).ready(function(){
    $('.showCountriesDiv').click(function(){
        $('.country').css('display','block');
    });
});

$(document).ready(function(){
    $('.showInstitutionsDiv').click(function(){
        $('.institution').css('display','block');
    });
});

$(document).ready(function(){
    $('.showPublishersDiv').click(function(){
        $('.publisher').css('display','block');
    });
});

$(document).ready(function(){
    $('.showDecitreDiv').click(function(){
        $('.decitre').css('display','block');
    });
});

$(document).ready(function(){
    $('.showCyberclassDiv').click(function(){
        $('.cyberclass').css('display','block');
    });
});

$(document).ready(function(){
    $('.darkDivClose').click(function(){
        $('.darkDiv').css('display','none');
    });
});

$(document).ready(function(){
    $('.darkDivButton').click(function(){
        $('.darkDiv').css('display','none');
    });
});
