
var acme = {};

acme.MovieList = function() {
  this._API_add = "/api/_add";
  this._API_delete = "/api/_delete/";
  this._$movies = $(".movies");
  this._$status = $(".status");
  this._$noRecords = $(".no-movies");
  this._$deleteModal = $("#deleteModal");
  this._deleted_history = [];

  $('button[data-role="add"]').on('click', $.proxy(function (e) {
    this._addRecord(e);
  },this));

  // add movie back to database if restore is clicked
  $('tbody').on('click', 'button[data-role="restore"]', $.proxy(function (e) {
    // get movie id
    var movieId = $(event.target).data('id');
    var movie;

    // get movie object from _deleted_history array
    for (var i = 0; i < this._deleted_history.length; i++) {
      if (this._deleted_history[i].id === movieId) {
        movie = this._deleted_history[i];
        break;
      }
    }

    this._addRecord(e, movie);
  },this));

  // delete the record when confirmed by user
  $('button[data-role="confirm-delete"]').on('click', $.proxy(function (e) {
    // get movie data from confirm-delete button's data
    var movieData = $(event.target).data();
    var movie = {
      id: movieData.id,
      title: movieData.title,
      year: movieData.year,
      genre: movieData.genre,
      director: movieData.director
    };

    this._deleteRecord(movie);
  },this));

  // add movie title to modal using modal show event
  $('#deleteModal').on('show.bs.modal', function (event) {
    var $deleteButton = $(event.relatedTarget);
    var $modal = $(this);
    var movieData = $deleteButton.data();

    // remove delete button's role so we don't override the confirm-delete
    // buttons role in the next step
    delete movieData.role;
    // add movie data to confirm-delete button
    $($modal).find('#confirm-delete').data(movieData);

    // add movie title to modal body
    $modal.find('#delete-title').text(movieData.title);
  });

  this.checkForEmpty();
}

acme.MovieList.prototype = {

  checkForEmpty: function(){
    // if there are no records, show "no records" msg
    this.hasNoRecords() ? this._$noRecords.show() : this._$noRecords.hide();
  },

  manageStatus: function(msg, do_show){
    this._$status.html(msg);
    do_show ? this._$status.fadeIn(10, "linear") : this._$status.fadeOut(4000, "easeInOutQuad");
  },

  hasNoRecords: function() {
    // do not consider "no-records" a record
    return this._$movies.find('tr').length > 1 ? false : true;
  },

  getRowHtml: function(movie_obj) {
    var row = $('<tr data-id="' + movie_obj.id + '" data-year="' + movie_obj.year + '" data-genre="' + movie_obj.genre + '" data-director="' + movie_obj.director + '" data-title="' + movie_obj.title + '">')
        title = $('<td><span class="title">' + movie_obj.title + '</span></td>'),
        year = $('<td><span class="year">' + movie_obj.year + '</span></td>'),
        genre = $('<td><span class="genre">' + movie_obj.genre + '</span></td>'),
        director = $('<td><span class="director">' + movie_obj.director + '</span></td>'),
        deleteBtn = $('<td id="delete-restore"><button class="delete btn btn-danger" data-role="delete" data-toggle="modal" data-target="#deleteModal" data-id="' + movie_obj.id + '" data-year="' + movie_obj.year + '" data-genre="' + movie_obj.genre + '" data-director="' + movie_obj.director + '" data-title="' + movie_obj.title + '"><span class="glyphicon glyphicon-remove"></span> Delete</button><button class="btn btn-default restore hidden" data-role="restore" data-id="' + movie_obj.id + '"><span class="glyphicon glyphicon-repeat"></span> Restore</button></td>');

    $(row).data(movie_obj).append(title, year, genre, director, deleteBtn);

    return row;
  },

  _addRecord: function(e, restoreObj) {
    e.preventDefault();
    e.stopImmediatePropagation();
    var movie = restoreObj || {
        title: $("#id-title").val(),
        year: $("#id-year").val(),
        genre: $("#id-genre").val(),
        director: $("#id-director").val()
    };

    this.manageStatus("Status: Sending request...", true);

    $.ajax({
        url: this._API_add,
        type: 'post',
        dataType: 'json',
        data: movie,
        success: $.proxy(function(data) {

          // remove deleted row once restored
          if (restoreObj) {
            $('tr.deleted[data-id="' + restoreObj.id + '"]').remove();
          }

          // report status
          this.manageStatus("Status: " + data.result, false);

          // add new record to list
          this._$movies.prepend(this.getRowHtml(data.new_movie));

          
          // fade out new record background color...
          $('tr[data-id="'+data.new_movie.id+'"]').removeClass("added", 4000, "easeInOutQuad");

          this.checkForEmpty();

        }, this)
    });
  },

  _deleteRecord: function(movie) {
    console.log('deleted', movie);
    this.manageStatus("Status: Deleting movie...", true);
    console.log(this._API_delete + movie.id + '/');
    $.ajax({
        url: this._API_delete + movie.id + '/',
        type: 'post',
        dataType: 'json',
        data: movie,
        success: $.proxy(function(data) {
          // update _deleted_history
          this._deleted_history.push(movie);

          // report status
          this.manageStatus("Status: deleted", false);

          // hide delete button and show restore button
          $('button.delete[data-id="' + data.id + '"]').addClass('hidden');
          $('button.restore[data-id="' + data.id + '"]').removeClass('hidden');

          // add deleted class to row
          $('tr[data-id="' + data.id + '"]').addClass('deleted');

          // close the modal
          this._$deleteModal.modal('hide');
        }, this)
    });
  }
}

$(document).ready(function(){
  acme.ml = new acme.MovieList();
});
