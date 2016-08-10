$(function() {
  var API_delete = "/api/_delete/",
      API_add = "/api/_add",
      $movies = $(".movies"),
      $status = $(".status"),
      $noRecords = $(".noMovies"),
      inputValidityStates = {
        title: false,
        year: false,
        genre: false
      };

  var checkForEmpty = function(){
    // if there are no records, show "no records" msg
    hasNoRecords() ? $noRecords.show() : $noRecords.hide();
  };

  var manageStatus = function(msg, doShow){
    $status.html(msg);
    doShow ? $status.fadeIn(10, "linear") : $status.fadeOut(4000, "easeInOutQuad");
  };

  var hasNoRecords = function() {
    // do not consider "no-records" a record
    return $movies.find("li").length > 0 ? false : true;
  };

  var delete_record = function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    // get data attrib of "data-id" on el
    var theID = $(this).parent().attr("data-id");

    $.getJSON(API_delete + theID, function(data) {

      // remove the record for the ID returned
      $('*[data-id="'+data.id+'"]').fadeOut(400, function() {
        $(this).remove();
        checkForEmpty();
      });
    });
    return false;
  };

  var add_record = function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();

      var movie = {
          title: $("#id-title").val(),
          year: $("#id-year").val(),
          genre: $("#id-genre").val()
      }

      // only submit if form inputs are valid
      if (checkFormValidity()) {
        manageStatus("Status: Sending request...", true);

        $.ajax({
            url: API_add,
            type: 'post',
            dataType: 'json',
            data: movie,
            success: function (data) {

                // report status
                manageStatus("Status: " + data.result, false);

                // add new record to list
                $movies.prepend(data.html);

                // fade out new record background color...
                $('*[data-id="'+data.movie_id+'"]').removeClass("added", 4000, "easeInOutQuad");
                checkForEmpty();
            }
        });
      }
  };

  function checkFormValidity() {
    var validity = true;
    for (var key in inputValidityStates) {
      // if any value is false (not valid) then stop here and return false
      if (!inputValidityStates[key]) {
        displayError(key);
        validity = false;
      }
    }

    return validity;
  }

  function validateEntry(inputEl) {
    var val = $(inputEl).val();
    var field = $(inputEl).attr('name');
    var elId = $(inputEl).attr('id');

    // trim whitespace from beginning and end of string
    val = $.trim(val);

    // check if blank (no fields can be blank)
    if (val === '') {
      displayError(field);
      return false;
    }

    // title specific validation
    if (field === 'title') {
      // check that title length is 60 chars or less
      if (val.length > 60) {
        displayError(field);
        return false;
      }
    }

    // year specific validation
    if (field === 'year') {
      // convert to number
      var num = parseFloat(val);

      // confirm number is between 1900 and 2015 inclusive (and thus positive)
      if ((num < 1900) || (num > 2015) || !Number.isInteger(num)) {
        displayError(field);
        return false;
      }

      // update year's value to number
      $(inputEl).val(num);
    }

    // title specific validation
    if (field === 'genre') {
      // check that genre length is 20 chars or less
      if (val.length > 20) {
        displayError(field);
        return false;
      }
    }

    // no validation errors, remove any existing message for this field
    $('#' + field + '-error').remove();
    return true;
  };

  function displayError(field) {
    // define error's id
    var id = field + '-error';

    // check if error for field already exists so we don't add it twice
    if ($('#' + id).length) {
      return;
    }
    // add the error div
    $('#invalid-input').append('<div id="' + id + '"><span>Error: Invalid ' + field + '</span><br></div>');
  };

  var init = function(){

    // bind click events for all elements
    // present and future
    $movies.on('click','a.delete',delete_record);

    // override default form submission behavior and call add_record instead
    $("input.add").on('click',add_record);

    // validate entries dynamically (immediately)
    $('#id-title, #id-year, #id-genre').keyup(function(e) {
      // get input field
      var field = $(this).attr('name');

      // check validity
      inputValidityStates[field] = validateEntry(this);
    });

    // handle messaging
    checkForEmpty();
  };

  init();

});

