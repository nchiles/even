//TABS
function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

//TODAY'S DATE IN HIDDEN INPUT VALUE
var options = { month: '2-digit', day: '2-digit' };
var today = new Date();
$("#datepicker").val(today.toLocaleDateString("en-US", options)); 

//PUT MAKE EVEN COST IN HIDDEN INPUT VALUE AND CHECK RADIO
var sourceOne = $("#makeevensource1").val();
var sourceTwo = $("#makeevensource2").val();

if ( sourceOne > 0 ) {
    var evenVal = sourceOne * 2;
    $("#btnControlA").prop("checked", true);
} else {
    var evenVal = sourceTwo * 2;
    $("#btnControlB").prop("checked", true);
}

$("#makeeven").val(evenVal);

//KEEP LINKS OPENING IN APP INSTEAD OF SAFARI
$(function() {
    $('a').click(function() {
    document.location = $(this).attr('href');
    return false;
    });
});   

//DISABLE SUBMIT UNLESS CHECKBOX CHECKED
var confirmCheck = $("#confirmCheck");
    confirmCheck.click(function() {
        if ($(this).is(":checked")) {
            $("#presubmit").prop("disabled", false);
        } else {
            $("#presubmit").prop("disabled", true);
        }
    });

$(function() {
    $("#dialog-confirm").dialog({
        resizable: false,
        height: 190,
        autoOpen: false,
        width: 330,
        modal: true,
        buttons: {
            "yes": function(){$.get("delete/user/expenses")

                $(this).dialog("close");

                location.reload();

                

                effects1 = function(){
                    $(".status-bar").load(location.href+" .status-bar>*",""); /* reload status bar */
                    return $(".status-bar");
                }

                effects2 = function(){
                    $(".status-bar-overlay").load(location.href+" .status-bar-overlay>*",""); /* reload status bar */
                    return $(".status-bar-overlay");
                }

                effects3 = function(){
                    $(".bg-overlay").fadeIn("fast").addClass("show-bg-overlay").delay(1200).fadeOut(1500); //background
                    $(".overlay").fadeIn("fast").addClass("show-overlay").delay(1200).slideUp(800).fadeOut(1000); //words
                    $(".status-bar-overlay").delay(1500).animate({"font-size":".5em"}).fadeOut(400).fadeIn().animate({"font-size":"2.5em"});
                    return $(".hasEffects");
                }

                function runAnimations() {  
                    [effects1,effects2,effects3];
                };

                runAnimations = function(functionArray) {
                    //extract the first function        
                    var func = functionArray.splice(0, 1);
                    //run it. and wait till its finished 
                    func[0]().promise().done(function() {
                        //then call run animations again on remaining array
                        if (functionArray.length > 0) runAnimations(functionArray);
                    });
                }
            },
            no: function() {
                $('#form').submit();
                $(this).dialog("close");
            },
            cancel: function() {
                $(this).dialog("close");
            }
        }
    });

    $('#presubmit').on('click', function(e) {
        $("#dialog-confirm").dialog('open');
    });
});

//UPDATE VARIABLES WITH AJAX
    $(() => {
        const $form = $('#form')

        $form.on('submit', handleForm)
        

        function handleForm(e) {
            e.preventDefault()
            
            const options = {
                method: $form.attr('method'),
                url: $form.attr('action'),
                data: $form.serialize(), 
                success: 
                    $(document).ready (function(){
                    

                        effects1 = function(){
                            $(".status-bar").load(location.href+" .status-bar>*",""); /* reload status bar */
                            return $(".status-bar");
                        }

                        effects2 = function(){
                            $(".status-bar-overlay").load(location.href+" .status-bar-overlay>*",""); /* reload status bar */
                            return $(".status-bar-overlay");
                        }

                        effects3 = function(){
                            $(".bg-overlay").fadeIn("fast").addClass("show-bg-overlay").delay(1200).fadeOut(1500); //background
                            $(".overlay").fadeIn("fast").addClass("show-overlay").delay(1200).slideUp(800).fadeOut(1000); //words
                            $(".status-bar-overlay").delay(1500).animate({"font-size":".5em"}).fadeOut(400).fadeIn().animate({"font-size":"2.5em"});
                            return $(".hasEffects");
                        }

                        effects4 = function(){
                            $('#form')[0].reset(); 
                            $('html, body').animate({scrollTop:0}, 'fast')
                        }

                        $('body').off().on('submit','#form', function() {  
                            runAnimations([effects1,effects2,effects3,effects4]);
                        });

                        runAnimations = function(functionArray) {
                        //extract the first function        
                        var func = functionArray.splice(0, 1);

                        //run it. and wait till its finished 
                        func[0]().promise().done(function() {

                            //then call run animations again on remaining array
                            if (functionArray.length > 0) runAnimations(functionArray);
                        });

                        }

                    })
            }
            

            $.ajax(options).done(response => {
                console.log(response);
                 
            })
        }    
    })
