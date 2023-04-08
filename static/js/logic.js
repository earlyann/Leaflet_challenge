// Initialize the map object
var myMap = L.map("map", {
    center: [15.7749, 20.4194],
    zoom: 2
});

// Add a tile layer (base map) to the map
L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
    attribution: '@esri'
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


// Function to create markers
function createMarkers(features) {
    var earthquakeMarkers = [];

    // Loop through the features array
    features.forEach(function(feature) {
        var magnitude = feature.properties.mag;
        var depth = feature.geometry.coordinates[2];
        var place = feature.properties.place;
        // Create a markerSize variable based on magnitude
        var markerSize = magnitude * 3;
        var markerColor = depthToColor(depth);
        // Create a circle marker with the appropriate radius and color
        var marker = L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
            radius: markerSize,
            fillColor: markerColor,
            color: "black",
            weight: .25,
            opacity: 1,
            fillOpacity: 0.75
        });
        // Bind a popup to the marker to show magnitude and depth on click
        marker.bindPopup(`<h4>${place}</h4><hr><h5>Magnitude: ${magnitude.toFixed(2)}</h5><h5>Depth: ${depth.toFixed(2)} km</h5>`);
        // Add the marker to the earthquakeMarkers array
        earthquakeMarkers.push(marker);
    });
    return L.layerGroup(earthquakeMarkers);
}


// Fetch data from the all the montly endpoints
Promise.all([
    d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"),
    d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson"),
    d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson"),
    d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson"),
    d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson")   
]).then(function([allData,mag1Data,mag2Data,mag4Data,significantData]) {
    //console.log(allData.features);

    // Create markers for both datasets
    var allMarkers = createMarkers(allData.features);
    var mag1Markers = createMarkers(mag1Data.features);
    var mag2Markers = createMarkers(mag2Data.features);
    var mag4Markers = createMarkers(mag4Data.features);
    var significantMarkers = createMarkers(significantData.features);

    // Add allMarkers layer to map by default
    myMap.addLayer(allMarkers);

    // Create overlay maps
    var overlayMaps = {
        "All Earthquakes": allMarkers,
        "Magnitude 1.0+": mag1Markers,
        "Magnitude 2.5+": mag2Markers,
        "Magnitude 4.5+": mag4Markers,
        "Significant Earthquakes": significantMarkers,
    };



    // Add a layer control
    L.control.layers(null, overlayMaps, {collapsed: false}).addTo(myMap);
});



// Create a legend control object
var legend = L.control({ position: "bottomright" });

// When the layer control is added, insert a div with the class of "legend"
legend.onAdd = function() {
    var div = L.DomUtil.create("div", "legend");

    div.innerHTML += "<h4>Depth</h4>";
    div.innerHTML += '<div class="gradient"></div>';
    div.innerHTML += '<div class="range">0<span style="float: right;">150+</span></div>';

    var color1 = depthToColor(5);
    var color2 = depthToColor(20);
    var color3 = depthToColor(40);
    var color4 = depthToColor(65);
    var color5 = depthToColor(90);
    var color6 = depthToColor(150);

    div.querySelector(".gradient").style.backgroundImage = `linear-gradient(to right, ${color1}, ${color2}, ${color3}, ${color4}, ${color5}, ${color6})`;

    return div;
};

legend.addTo(myMap);