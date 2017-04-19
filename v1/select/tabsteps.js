
$(document).ready(function(){
    
    /*
        Form
    */
    $('.registration-form fieldset:first-child').fadeIn('slow');

    
    /*Automatically Highlight Step One*/
    
    $('.step').eq(0).addClass('active');
    
    // next step
    $('.registration-form .btn-next').on('click', function() {
    	var parent_fieldset = $(this).parents('fieldset');
    	var next_step = true;
        var targetStep = parent_fieldset.index();
        //alert(parent_fieldset.index());
        
        //Change the tick Color
        
        $('.step').eq(targetStep+1).addClass('active');
        //$('.check').eq(targetStep).prev().removeClass('active');
    	
//    	parent_fieldset.find('input[type="text"], input[type="password"], textarea').each(function() {
//    		if( $(this).val() == "" ) {
//    			$(this).addClass('input-error');
//    			next_step = false;
//    		}
//    		else {
//    			$(this).removeClass('input-error');
//    		}
//    	});
    	
    	if( next_step ) {
    		parent_fieldset.fadeOut(400, function() {
	    		$(this).next().fadeIn();
	    	});
    	}
    	
    });
    
    // previous step
    $('.registration-form .btn-previous').on('click', function() {
    	var parent_fieldset = $(this).parents('fieldset');
        var targetStep = parent_fieldset.index();
        
        //Remove active tick Color
        
        $('.description .step').eq(targetStep).removeClass('active');

    	$(this).parents('fieldset').fadeOut(400, function() {
            $(this).prev().fadeIn();
    	});
    });
  
       
});
