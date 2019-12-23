//NEW
$(function () {
  $("#datepicker").datepicker({
    dateFormat: 'mm/dd',
    beforeShow: function (input, inst) { //makes field required
      setTimeout(function () {
        inst.dpDiv.css({
          top: $("#datepicker").offset().top + 35,
          left: $("#datepicker").offset().left
        });
      }, 0);
    }
  }).on('focus', function () {
    $(this).trigger('blur'); //disables keyboard from showing on mobile
  });
});

//Keep links opening in app instead of switching to Safari (all ejs)
$(function () {
  $('a').click(function () {
    document.location = $(this).attr('href');
    return false;
  });
});

//Show clear expenses div in show_expenses.ejs when users are evem, but not when table is empty
// if ( ($('#isEven').html() !== "even") && ($('.total-spent').html() == "0") ) {
//   $('#clear-expenses').hide();
// }
//////////////////// ^not sure why this doesn't work ^ ///////////////////////
if ( $('#isEven').html() !== "even" ) {
  $('#clear-expenses').hide();
}

if ($('.total-spent').html() == "0") {
  $('#clear-expenses').hide();
}

// $.ajax({
//   type: "POST",
//   url: 'add-ink',
//   data: {
//     ink: ink,
//   }
// }).done (function(r) {
//     if (ink) {
//       $("#addResult").html('<i class="fa fa-check"></i>');
//     } else {
//       $("#addResult").html("error");
//     }
// }).fail(function(err) {
//   console.error(err);
//   $("#addResult").html('<i class="fa fa-times"></i>'); 
//   // $("#duplicate").html("Duplicate Ink"); 
// });
// $('#addform').each(function(){
//   this.reset();
// });

// if (aOwesB < 0) { 
//   currentUser.userB  owes  currentUser.userA  $ Math.round(bOwesA) 
// } else if (bOwesA < 0) {   
//   currentUser.userA  owes  currentUser.userB  $ Math.round(aOwesB) 
// } else { 
//   even
// }   

// vars needed from server
// aOwesB
// bOwesA
// currentUser.userA
// currentUser.userB

//Update totals after submit expense
$(() => {
  const form = $('#form')

  form.on('submit', handleForm)
  function handleForm(e) {
    e.preventDefault()

    const options = {
      method: form.attr('method'),
      url: form.attr('action'),
      data: form.serialize(),
      success:
        $(document).ready(function () {

          effects1 = function () {
            $(".status-bar").load(location.href + " .status-bar>*", ""); /* reload status bar */
            return $(".status-bar");
          }

          // effects2 = function () {
          //   $(".status-bar-overlay").load(location.href + " .status-bar-overlay>*", ""); /* reload status bar */
          //   return $(".status-bar-overlay");
          // }

          // effects3 = function () {
          //   $(".bg-overlay").fadeIn("fast").addClass("show-bg-overlay").delay(1200).fadeOut(1500); //background
          //   $(".overlay").fadeIn("fast").addClass("show-overlay").delay(1200).slideUp(800).fadeOut(1000); //words
          //   $(".status-bar-overlay").delay(1500).animate({ "font-size": ".5em" }).fadeOut(400).fadeIn().animate({ "font-size": "2.5em" });
          //   return $(".hasEffects");
          // }

          effects4 = function () {
            $('#form')[0].reset();
            $('html, body').animate({ scrollTop: 0 }, 'fast')
          }

          $('body').off().on('submit', '#form', function () {
            runAnimations([effects1, effects4]);
          });

          runAnimations = function(functionArray) {
            //extract the first function        
            var func = functionArray.splice(0, 1);
            //run it. and wait till its finished 
            func[0]().promise().done(function () {
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


//SHOW EXPENSES
//fix total spent by adding original (fake calculated) payment and subtracting actual payment
//if expense.desc = "partial expense" hide expense.amount and display expense.amount / 2
// $(".partial-desc").each(function () {
//   var text = $(this, ".partial-desc").html()
//   // console.log(text);\
//   if (text === "full payment 🥳") {
//     $(this).css("font-weight", "600")
//   }
//   if (text === "partial payment 🙂") {
//     $(this).css("font-weight", "600")
//     $(this).siblings(".partial-cost").css("display", "none");
//     var amount = parseInt($(this).siblings(".partial-cost").html()) / 2;
//     console.log(amount);
//     $(this).siblings(".partial-payment").css("display", "block").html(amount);
//   }
// });

//Bring up edit modal
$('.edit-modal').click(function() {
  var id = $(this).parent().siblings('.item-id').text();
  var action = "/" + id + "?_method=PUT";
  var href = "delete/" + id;
  var date = $(this).parent().siblings('.item-date').text();
  var desc = $(this).parent().siblings('.item-desc').text();
  var cost = $(this).parent().siblings('.item-cost').text();

  function getAction() {
    $('#modal-form').attr("action", action)
    $('#modal-delete').attr("href", href)
  }
  getAction();

  $('[name="expense[date]"]').val(date);
  $('[name="expense[desc]"]').val(desc);
  $('[name="expense[amount]"]').val(cost);
});

//Collapse tables (show_expenses.ejs & archive.ejs)
$(".table-user").click(function () {
  $(this).toggleClass("table-user-clicked");
  $header = $(this);
  //getting the next element
  $content = $header.next();
  //open up the content needed - toggle the slide- if visible, slide up, if not slidedown.
  $content.slideToggle(400);
});
