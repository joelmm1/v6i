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
       },2000,function()
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
       },2000,function()
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
       },2000,function()
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
});