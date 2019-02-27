var map = L.map('mapid').setView([37.561959,-122.325554], 13);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
var latlngs = [[37,-122],[38,-122],[38,-123],[37,-123]];
var markers = [];
var polyline = L.polyline(latlngs, {color: '#5100B5', opacity: 0.5}).addTo(map);
var PATHDISTANCE = 10000;
function resetNodes(){
  for (var nodeTag in nodeDict) {
    nodeDict[nodeTag].visited = false;
  }
}
function initHeuristicDistance(startingNode){
  for (var nodeTag in nodeDict) {
    nodeDict[nodeTag].distance = getDistance(startingNode.latitude, startingNode.longitude, nodeDict[nodeTag].latitude, nodeDict[nodeTag].longitude);
  }
}
function onMapClick(e) {
  var shortestDistance = Infinity;
  var closestNode;
  for (var nodeTag in nodeDict) {
    var distanceFromClick = getDistance(e.latlng.lat, e.latlng.lng, nodeDict[nodeTag].latitude, nodeDict[nodeTag].longitude);
    if(distanceFromClick<shortestDistance){
      shortestDistance = distanceFromClick;
      closestNode = nodeDict[nodeTag];
    }
  }
  var marker = L.marker([closestNode.latitude,closestNode.longitude]).addTo(map);
  latlngs.push([closestNode.latitude,closestNode.longitude]);
  markers.push(marker);
  polyline.setLatLngs(latlngs);
}
function chooseNeighborNode(currentNode, neighborEdges){
  var furthestDistance = -1;
  var neighborEdge;
  for (var index in neighborEdges){
    var currentNeighbor = neighborEdges[index].getOther(currentNode);
    if(currentNeighbor.distance>furthestDistance){
      furthestDistance = currentNeighbor.distance;
      neighborEdge = neighborEdges[index];
    }
  }
  neighborNode = neighborEdge.getOther(currentNode);
  return [neighborNode, neighborEdge];
}
function onKeyPress(e) {
    if(e.originalEvent.key==="q"){  //remove last marker from the map
      if(markers.length>0){
        markers.pop().remove();
        latlngs.pop();
        polyline.setLatLngs(latlngs);
      }
    }
    if(e.originalEvent.key==="w"){
      while(markers.length>0){
        markers.pop().remove();
      }
      latlngs = [];
      polyline.setLatLngs(latlngs);
    }
    if(e.originalEvent.key==="g"){
      resetNodes();
      while(markers.length>0){
        markers.pop().remove();
      }
      latlngs = [];
      var startingNode = nodeDict["564663890"];
      initHeuristicDistance(startingNode);
      var path = [];
      var distanceTraveled = 0;
      var currentNode = startingNode;
      while(distanceTraveled<PATHDISTANCE){
        currentNode.visited = true;
        path.push([currentNode.latitude, currentNode.longitude]);
        var neighborEdgesUnvisited = [];
        for(i = 0; i < currentNode.edges.length; i++){
          var edgeNode = currentNode.edges[i].getOther(currentNode);
          if(!edgeNode.visited){
            neighborEdgesUnvisited.push(currentNode.edges[i]);
          }
        }
        var neighborNode;
        if(neighborEdgesUnvisited.length>0){
          neighborData = chooseNeighborNode(currentNode, neighborEdgesUnvisited);
          neighborNode = neighborData[0];
          neighborEdge = neighborData[1];
        }
        else{
          var neighborEdge = currentNode.edges[Math.floor(Math.random() * currentNode.edges.length)];
          var neighborNode = neighborEdge.getOther(currentNode);
        }
        distanceTraveled = distanceTraveled + neighborEdge.distance;
        currentNode = neighborNode;
      }
      for(i = 0; i < path.length; i++){
        latlngs.push(path[i]);
        markers.push(L.marker(path[i]).addTo(map));
      }
      polyline.setLatLngs(latlngs);
    }
}
map.on('click', onMapClick);
map.on('keypress', onKeyPress);
