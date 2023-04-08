// Initialize the map object
var myMap = L.map("map", {
    center: [37.7749, -122.4194], // You can set the initial map center coordinates
    zoom: 3
  });
  
  // Add a tile layer (base map) to the map
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(myMap);
  
  // Function to convert depth to color
  function depthToColor(depth) {
    if (depth < 10) return "#98ee00";
    if (depth < 30) return "#d4ee00";
    if (depth < 50) return "#eecc00";
    if (depth < 70) return "#ee9c00";
    if (depth < 90) return "#ea822c";
    return "#ea2c2c";
  }
  
  // Fetch data from the "all_week.geojson" endpoint
  d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
    .then(function(data) {
      console.log(data.features);
      createMarkers(data.features);
    });
  
  // Example function to create markers
  function createMarkers(features) {
    // Create an empty array to store the markers
    var earthquakeMarkers = [];
  
    // Loop through the features
    features.forEach(function(feature) {
      // Extract the magnitude and depth from the feature
      var magnitude = feature.properties.mag;
      var depth = feature.geometry.coordinates[2];
  
      // Define the marker size and color based on the magnitude and depth
      var markerSize = magnitude * 5;
      var markerColor = depthToColor(depth);
  
      // Create a circle marker for each earthquake
      var marker = L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
        radius: markerSize,
        fillColor: markerColor,
        color: "black",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
  
      // Add the marker to the earthquakeMarkers array
      earthquakeMarkers.push(marker);
    });
  
    // Create a layer group from the earthquakeMarkers array and add it to the map
    L.layerGroup(earthquakeMarkers).addTo(myMap);
  }
  
// Create a legend control object
var legend = L.control({ position: "bottomright" });

// When the layer control is added, insert a div with the class of "legend"
legend.onAdd = function() {
    var div = L.DomUtil.create("div", "legend");
  
    // Add legend HTML
    div.innerHTML += "<h4>Depth</h4>";
    div.innerHTML += '<div class="gradient"></div>';
    div.innerHTML += '<div class="range">0<span style="float: right;">150+</span></div>';
  
    // Calculate colors and set the background-image property
    var color1 = depthToColor(5);
    var color2 = depthToColor(20);
    var color3 = depthToColor(40);
    var color4 = depthToColor(65);
    var color5 = depthToColor(90);
    var color6 = depthToColor(150);
  
    div.querySelector(".gradient").style.backgroundImage = `linear-gradient(to right, ${color1}, ${color2}, ${color3}, ${color4}, ${color5}, ${color6})`;
  
    return div;
};
  