
//Declare a variable to store the searched 
var city="";
// variable declaration
var searchCity = $("#search-city");
var searchButton = $("#search-button");
var clearButton = $("#clear-history");
var currentCity = $("#current-city");
var currentTemperature = $("#temperature");
var currentHumidty= $("#humidity");
var currentWSpeed=$("#wind-speed");
var currentUvindex= $("#uv-index");
var currentimage= $("#image");
var sCity=[];
// searches the city to see if it exists in the entries from the storage
function find(c){
    for (var i=0; i<sCity.length; i++){
        if(c.toUpperCase()===sCity[i]){
            return -1;
        }
    }
    return 1;
}
//Set up the API key
var APIKey="a0aca8a89948154a4182dcecc780b513";
// Display the curent and future weather to the user after grabing the city form the input text box.
function displayWeather(event){
    event.preventDefault();
    if(searchCity.val().trim()!==""){
        city=searchCity.val().trim();
        currentWeather(city);
    }
}
// Here we create the AJAX call
function currentWeather(city){
    // Here we build the URL so we can get a data from server side.
    var queryURL= "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    $.ajax({
        url:queryURL,
        method:"GET",
    }).then(function(response){

        // parse the response to display the current weather including the City name. the Date and the weather icon. 
        console.log(response);
        //Dta object from server side Api for icon property.
        var weathericon= response.weather[0].icon;
        var iconurl="https://openweathermap.org/img/wn/"+weathericon +"@2x.png";
        // The date format method is taken from the  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
        var date=new Date(response.dt*1000).toLocaleDateString();
        //parse the response for name of city and concanatig the date and icon.
        $(currentCity).html(response.name +" ("+date+")"/*);   //*/+ "<img src="+iconurl+">");
        //to display image -----vk
        //$(currentimage).html("<img src="+iconurl+">"); //------vk
        // parse the response to display the current temperature.
        // Convert the temp to fahrenheit

        //var tempF = (response.main.temp - 273.15) * 1.80 + 32;  // fahrenheit
        var tempF = (response.main.temp - 273.15);  //celsius
        $(currentTemperature).html((tempF).toFixed(2)+"&#8451");
        // Display the Humidity
        $(currentHumidty).html(response.main.humidity+"%");
        //Display Wind speed and convert to MPH
        var ws=response.wind.speed;
        var windsmph=(ws*2.237).toFixed(1);
        $(currentWSpeed).html(windsmph+"MPH");
        // Display UVIndex.
        //By Geographic coordinates method and using appid and coordinates as a parameter we are going build our uv query url inside the function below.
        UVIndex(response.coord.lon,response.coord.lat);
        forecast(response.id);
        if(response.cod==200){
            sCity=JSON.parse(localStorage.getItem("cityname"));
            console.log(sCity);
            if (sCity==null){
                sCity=[];
                sCity.push(city.toUpperCase()
                );
                localStorage.setItem("cityname",JSON.stringify(sCity));
                addToList(city);
            }
            else {
                if(find(city)>0){
                    sCity.push(city.toUpperCase());
                    localStorage.setItem("cityname",JSON.stringify(sCity));
                    addToList(city);
                }
            }
        }

    });
}
    // This function returns the UVIindex response.
function UVIndex(ln,lt){
    //lets build the url for uvindex.
    var uvqURL="https://api.openweathermap.org/data/2.5/uvi?appid="+ APIKey+"&lat="+lt+"&lon="+ln;
    $.ajax({
            url:uvqURL,
            method:"GET"
            }).then(function(response){
                $(currentUvindex).html(response.value);
            });
}
    
// Here we display the 5 days forecast for the current city.
function forecast(cityid){
    var dayover= false;
    var queryforcastURL="https://api.openweathermap.org/data/2.5/forecast?id="+cityid+"&appid="+APIKey;
    $.ajax({
        url:queryforcastURL,
        method:"GET"
    }).then(function(response){
        
        for (i=0;i<5;i++){
            var date= new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
            var iconcode= response.list[((i+1)*8)-1].weather[0].icon;
            var iconurl="https://openweathermap.org/img/wn/"+iconcode+".png";
            var tempK= response.list[((i+1)*8)-1].main.temp;
            var tempF=(tempK-273.5).toFixed(2);
            var humidity= response.list[((i+1)*8)-1].main.humidity;
        
            $("#fDate"+i).html(date);
            $("#fImg"+i).html("<img src="+iconurl+">");
            $("#fTemp"+i).html(tempF+"&#8451");
            $("#fHumidity"+i).html(humidity+"%");
        }
        
    });
}

//Daynamically add the passed city on the search history
function addToList(c){
    var listEl= $("<li>"+c.toUpperCase()+"</li>");
    $(listEl).attr("class","list-group-item");
    $(listEl).attr("data-value",c.toUpperCase());
    $(".list-group").append(listEl);
}

/* GPS location access
function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error);
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }
  
  function success(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    var queryURL =
      "https://api.openweathermap.org/data/2.5/weather?lat=" +
      latitude +
      "&lon=" +
      longitude +
      "&appid=" +
      APIKey;
  
    $.ajax({
      url: queryURL,
      method: "GET",
    }).then(function (response) {
      city = response.name;
      currentWeather(city);
    });
  }
  
  function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }
  
  // Call the getLocation function to access GPS location
  getLocation();
 */

// GPS location access
function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error, { enableHighAccuracy: true });
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }
  
  function success(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
  
    // Reverse Geocoding API endpoint
    var reverseGeocodingURL = "https://api.openweathermap.org/geo/1.0/reverse?lat=" + latitude + "&lon=" + longitude + "&limit=1&appid=" + APIKey;
  
    // Fetch the location address using Reverse Geocoding
    fetch(reverseGeocodingURL)
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          var city = data[0].name;
          currentWeather(city);
        }
      })
      .catch(error => {
        console.log("Error fetching location address:", error);
      });
  }
  
  function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }
  
  // Call the getLocation function to access GPS location
  getLocation();
  






  
// display the past search again when the list group item is clicked in search history
function invokePastSearch(event){
    var liEl=event.target;
    if (event.target.matches("li")){
        city=liEl.textContent.trim();
        currentWeather(city);
    }

}

// render function
function loadlastCity(){
    $("ul").empty();
    var sCity = JSON.parse(localStorage.getItem("cityname"));
    if(sCity!==null){
        sCity=JSON.parse(localStorage.getItem("cityname"));
        for(i=0; i<sCity.length;i++){
            addToList(sCity[i]);
        }
        city=sCity[i-1];
        currentWeather(city);
    }

}
//Clear the search history from the page
function clearHistory(event){
    event.preventDefault();
    sCity=[];
    localStorage.removeItem("cityname");
    document.location.reload();

}
//Click Handlers
$("#search-button").on("click",displayWeather);
$(document).on("click",invokePastSearch);
$(window).on("load",loadlastCity);
$("#clear-history").on("click",clearHistory);




//my codes
window.onload=function(){
    var currentTime=new Date().getHours(); currentImg="", currentcolor="";
    if ( currentTime >=6 && currentTime <12){ 
        currentImg="image/mrng.jpg";
        //document.getElementsByClassName('btn')[1].style.background="#94BBE9";
        currentcolor= "linear-gradient(45deg, rgba(148,187,233,1) 0%, rgba(238,174,202,1) 100%)";
     }
    else if ( currentTime >=12 && currentTime <14){ 
        currentImg="image/noon.jpg";
        //document.getElementsByClassName('btn')[1].style.background="#22C1C3";
        currentcolor= "linear-gradient(45deg, rgba(34,193,195,1) 0%, rgba(253,187,45,1) 100%)";
     }
    else if ( currentTime >=14 && currentTime <19){ 
        currentImg="image/evng.jpg";
        //document.getElementsByClassName('btn')[1].style.background="#FD1D1D";
        currentcolor= "linear-gradient(45deg, rgba(131,58,180,1) 0%, rgba(253,29,29,1) 50%, rgba(252,176,69,1) 100%)";
     }
    else if ( currentTime >=19 || currentTime <6){ 
        currentImg="image/nig.jpg";
        //document.getElementsByClassName('btn')[1].style.background="deepskyblue";
        currentcolor= "linear-gradient(45deg, rgba(9,9,121,1) 0%, rgba(0,212,255,1) 100%)";
     }
     //for bg of 5 element
    const collection = document.getElementsByClassName('col-sm-2');
    for (let i = 0; i < collection.length; i++) {
        collection[i].style.background = currentcolor;
    }
    //bg of whole body
    document.body.style.background="url("+currentImg+") no-repeat top right";
    document.body.style.backgroundSize = "cover";
}
















