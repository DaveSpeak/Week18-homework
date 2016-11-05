console.log('got to the app.js');
var articleNum = 0;
var articleStor =[];

$.getJSON('/scrape', function(){
  console.log('back from the scrape in app.js');
});

$(document).on('click','#startengine', function(){
  // grab the articles as a json
  $.getJSON('/articles', function(data) {
    // for each one
    console.log('in the /articles');
    console.log(data[0]);
      for (var i = 0; i<data.length; i++){
        // display the apropos information on the page
        var placeholder = {};
        placeholder.id=data[i]._id;
        placeholder.title=data[i].title;
        placeholder.link=data[i].link;
        articleStor.push(placeholder);
      }
      updateNote();
  });
});

$(document).on('click','#nextArticle', function(){
  if (articleNum<articleStor.length){
    articleNum+=1;
    // $('#articles').empty();
    updateNote();
   //  var dataContainer=$('<div>')
   //  dataContainer.append($('<p>').attr({'data-id':articleStor[articleNum].id, 'style':'margin-bottom:0'}).html(articleStor[articleNum].title));
   //  dataContainer.append($('<a>').attr({'href':articleStor[articleNum].link}).html(articleStor[articleNum].link));
   //  dataContainer.append($('<br>'));
   // $('#articles').append(dataContainer);
   // $('#notedata').empty();
   // $.ajax({
   //    method:"GET",
   //    url: "/articles/" + articleStor[articleNum].id,
   // })
   // .done(function(data){
   //  console.log('getting the data');
   //  // console.log(data.note);
   //  $('#notedata').empty();
   //  for (var i=0;i<data.length;i++){
   //    $("#notedata").append($('<p>').attr({"class":"notepara"}).html(data[i].body));
   //  }
   // });
  }
});
$(document).on('click','#prevArticle', function(){
  if (articleNum>0){
    articleNum-=1;
    // $('#articles').empty();
    updateNote();
   //  var dataContainer=$('<div>')
   //  dataContainer.append($('<p>').attr({'data-id':articleStor[articleNum].id, 'style':'margin-bottom:0'}).html(articleStor[articleNum].title));
   //  dataContainer.append($('<a>').attr({'href':articleStor[articleNum].link}).html(articleStor[articleNum].link));
   //  dataContainer.append($('<br>'));
   // $('#articles').append(dataContainer);
   // $('#notedata').empty();
   // $.ajax({
   //    method:"GET",
   //    url: "/articles/" + articleStor[articleNum].id,
   // })
   // .done(function(data){
   //  console.log('getting the data');
   //  // console.log(data.note);
   //  $('#notedata').empty();
   //  for (var i=0;i<data.length;i++){
   //    $("#notedata").append($('<p>').attr({"class":"notepara"}).html(data[i].body));
   //  }
   // });
  }
});

// whenever someone clicks a p tag
$(document).on('click', 'p.notepara', function(){
  // empty the notes from the note section
  // $('#notedata').empty();
  // console.log('clearing the note');
  // var something=$(this).attr('noteid');
  // console.log(something);
  // save the id from the p tag
  var thisId = $(this).attr('noteid');

  // now make an ajax call for the Article
  $.ajax({
    method: "POST",
    url: "/delnote/" + thisId,
  })
    // with that done, add the note information to the page
    .done(function( data ) {
      // console.log('back from the ajax');
      // console.log(data);
      updateNote();
      // // the title of the article
      // $('#notes').append('<h2>' + data.title + '</h2>'); 
      // // an input to enter a new title
      // $('#notes').append('<input id="titleinput" name="title" >'); 
      // // a textarea to add a new note body
      // $('#notes').append('<textarea id="bodyinput" name="body"></textarea>'); 
      // // a button to submit a new note, with the id of the article saved to it
      // $('#notes').append('<button data-id="' + data._id + '" id="savenote">Save Note</button>');

      // // if there's a note in the article
      // if(data.note){
      //   // place the title of the note in the title input
      //   $('#titleinput').val(data.note.title);
      //   // place the body of the note in the body textarea
      //   $('#bodyinput').val(data.note.body);
      // }
    });
});

// when you click the savenote button
$(document).on('click', '#savenote', function(){
  // grab the id associated with the article from the submit button
  var thisId =articleStor[articleNum].id;

  // run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      title: articleStor[articleNum].title, // value taken from title input
      body: $('#noteinput').val() // value taken from note textarea
    }
  })
    // with that done
    .done(function( data ) {
      // log the response
      // console.log(data);
      // empty the notes section
      // $('#notedata').append($('#noteinput').val(),$('<br>'));
      updateNote();
      $('#noteinput').val("");
    });

  // Also, remove the values entered in the input and textarea for note entry
  // $('#titleinput').val("");
  // $('#bodyinput').val("");
});

function updateNote(){
  console.log('updating notes');
  $('#articles').empty();
  var dataContainer=$('<div>')
  dataContainer.append($('<p>').attr({'data-id':articleStor[articleNum].id, 'style':'margin-bottom:0'}).html(articleStor[articleNum].title));
  dataContainer.append($('<a>').attr({'href':articleStor[articleNum].link}).html(articleStor[articleNum].link));
  dataContainer.append($('<br>'));
  $('#articles').append(dataContainer);
  // console.log('getting the notes');
  // console.log(articleStor[articleNum].id);
  $.ajax({
    method:"GET",
    url: "/articles/" + articleStor[articleNum].id,
  })
  .done(function(data){
    // console.log('got the data');
    // console.log(data.length);
    // console.log(data);
    // console.log(data[0].body);
    $('#notedata').empty();
    for (var i=0;i<data.length;i++){
      $("#notedata").append($('<p>').attr({"class":"notepara","noteid":data[i]._id}).html(data[i].body));
    }
  });
}