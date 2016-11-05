// articleNum shows position in articleStor(containing article info)
var articleNum = 0;
var articleStor =[];
// call the scraper
$.getJSON('/scrape', function(){
});

// After ajax query is complete, get data & push it to array
$(document).on('click','#startengine', function(){
  // grab the articles as a json
  $.getJSON('/articles', function(data) {
    // loop thru articles & push to array
      for (var i = 0; i<data.length; i++){
        // display the information on the page
        var placeholder = {};
        placeholder.id=data[i]._id;
        placeholder.title=data[i].title;
        placeholder.link=data[i].link;
        articleStor.push(placeholder);
      }
      updateNote();
  });
});
// move article to the next article (if it isn't the last)
$(document).on('click','#nextArticle', function(){
  if (articleNum<articleStor.length){
    articleNum+=1;
    updateNote();
  }
});
// move article to the previous article (if it isn't the first)
$(document).on('click','#prevArticle', function(){
  if (articleNum>0){
    articleNum-=1;
    updateNote();
  }
});

// delete note when clicked on
$(document).on('click', 'p.notepara', function(){
  var thisId = $(this).attr('noteid');

  // now make an ajax call to delete the note
  $.ajax({
    method: "POST",
    url: "/delnote/" + thisId,
  })
    // now reset the page
    .done(function( data ) {
      updateNote();
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
      updateNote();
      $('#noteinput').val("");
    });

});

function updateNote(){
  // Empty articles container & put new one in
  $('#articles').empty();
  var dataContainer=$('<div>')
  dataContainer.append($('<p>').attr({'data-id':articleStor[articleNum].id, 'style':'margin-bottom:0'}).html(articleStor[articleNum].title));
  dataContainer.append($('<a>').attr({'href':articleStor[articleNum].link}).html(articleStor[articleNum].link));
  dataContainer.append($('<br>'));
  $('#articles').append(dataContainer);
  // Get associated notes
  $.ajax({
    method:"GET",
    url: "/articles/" + articleStor[articleNum].id,
  })
  .done(function(data){
    // put notes in container
    $('#notedata').empty();
    for (var i=0;i<data.length;i++){
      $("#notedata").append($('<p>').attr({"class":"notepara","noteid":data[i]._id}).html(data[i].body));
    }
  });
}