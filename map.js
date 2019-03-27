var map = L.map('mapid').setView([37.561959,-122.325554], 13);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
var latlngs = [];
var markers = [];
var polyline = L.polyline(latlngs, {color: '#5100B5', opacity: 0.5}).addTo(map);
var selectedNode;
var PATHDISTANCE = 6000;
function resetNodes(){
  for (var nodeTag in nodeDict) {
    nodeDict[nodeTag].visited = false;
    nodeDict[nodeTag].rootDistance = Number.MAX_VALUE;
    nodeDict[nodeTag].parent = null;
  }
}
function initHeuristicDistance(startingNode){
  for (var nodeTag in nodeDict) {
    nodeDict[nodeTag].distance = getDistance(startingNode.latitude, startingNode.longitude, nodeDict[nodeTag].latitude, nodeDict[nodeTag].longitude);
  }
}
function onMapClick(e) {
  deleteCurrentPath();
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
  selectedNode = closestNode;
}
function addNodesToMap(newNodesList){
  for(i = 0; i < newNodesList.length; i++){
    latlngs.push([newNodesList[i].latitude,newNodesList[i].longitude]);
    markers.push(L.marker([newNodesList[i].latitude,newNodesList[i].longitude]).addTo(map));
  }
}
function addPathToMap(newNodePath){
  for(i = 0; i < newNodePath.length; i++){
    latlngs.push([newNodePath[i].latitude,newNodePath[i].longitude]);
  }
  markers.push(L.marker([newNodePath[0].latitude,newNodePath[0].longitude]).addTo(map));
  markers.push(L.marker([newNodePath[newNodePath.length-1].latitude,newNodePath[newNodePath.length-1].longitude]).addTo(map));
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
function deleteCurrentPath(){
  while(markers.length>0){
    markers.pop().remove();
  }
  latlngs = [];
  polyline.setLatLngs(latlngs);
}
function removeLastNode(){
  if(markers.length>0){
    markers.pop().remove();
    latlngs.pop();
    polyline.setLatLngs(latlngs);
  }
}
function onKeyPress(e) {
    if(e.originalEvent.key==="q"){  //remove last marker from the map
      removeLastNode();
    }
    if(e.originalEvent.key==="w"){
      deleteCurrentPath();
    }
    if(e.originalEvent.key==="t"){
      deleteCurrentPath();
      var targetNodes = findTargetNodes(selectedNode, PATHDISTANCE, nodeDict);
      console.log("targetsfound")
      var targetNode = targetNodes[Math.floor(Math.random() * targetNodes.length)];
      var path = generateOutPath(selectedNode, targetNode);
      addPathToMap(path);
    }
    if(e.originalEvent.key==="g"){
      resetNodes();
      deleteCurrentPath();
      var startingNode = selectedNode;
      var path = [];
      initHeuristicDistance(startingNode);
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
          [neighborNode, neighborEdge] = chooseNeighborNode(currentNode, neighborEdgesUnvisited);
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
