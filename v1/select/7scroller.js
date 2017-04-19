$(document).ready(function(){

var scrollA_dis = "155px";
var scrollB_dis = "580px";
var scrollCC_dis = "720px";

var jumpA=function(e)
{
       //prevent the "normal" behaviour which would be a "hard" jump
       e.preventDefault();
       //Get the target
       var target = $(this).attr("class");
       //perform animated scrolling
       $('html,body').animate(
       {
               //get top-position of target-element and set it as scroll target
               scrollTop: scrollA_dis//$(target).offset().top
       //scrolldelay: 2 seconds
       },500,function()
       {
               //attach the hash (#jumptarget) to the pageurl
               location.hash = target;
       });

}

var jumpB=function(e)
{
       //prevent the "normal" behaviour which would be a "hard" jump
       e.preventDefault();
       //Get the target
       var target = $(this).attr("class");
       //perform animated scrolling
       $('html,body').animate(
       {
               //get top-position of target-element and set it as scroll target
               scrollTop: scrollB_dis//$(target).offset().top
       //scrolldelay: 2 seconds
       },500,function()
       {
               //attach the hash (#jumptarget) to the pageurl
               location.hash = target;
       });

};

var jumpCC=function(e)
{
       //prevent the "normal" behaviour which would be a "hard" jump
       e.preventDefault();
       //Get the target
       var target = $(this).attr("class");
       //perform animated scrolling
       $('html,body').animate(
       {
               //get top-position of target-element and set it as scroll target
               scrollTop: scrollCC_dis//$(target).offset().top
       //scrolldelay: 2 seconds
       },500,function()
       {
               //attach the hash (#jumptarget) to the pageurl
               location.hash = target;
       });

};

    setTimeout(function(){

           $('.scrollA').bind("click", jumpA);
           $('.scrollB').bind("click", jumpB);
           setTimeout(function(){
                $('.scrollCC').bind("click", jumpCC);
           },3000);
           return false;
    },1000);
    
    
    $('#bubble_BUTTON_23').click(function(){
        setTimeout(function(){
            $('#advtab').click();
        },0);
        
    });
    
    $('.back_toQuick').click(function(){
        setTimeout(function(){
            $('#quicktab').click();
        },0);
    });
    
    $('.quickResults').click(function(){
        setTimeout(function(){
            //$('#quicktab').click();
        },0);
    });
    
    //Adjust Slider
    
    var windowH = $(window).height();
    var windowW = $(window).width();
    if(windowW>480){
      $(".slick-slider").height(windowH-30); 
    }
           
});