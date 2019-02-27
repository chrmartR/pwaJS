function getDistance(lat1,lon1,lat2,lon2) { //distance between two points on the earth based on lat and lon
  var R = 6356.752; // Radius of the earth in km
  var dLat = d2r(lat2-lat1);  // deg2rad below
  var dLon = d2r(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(d2r(lat1)) * Math.cos(d2r(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d * 1000; //distance in m
}

function d2r(deg) {
  return deg * (Math.PI/180)
}
function Node(lat,lon,num){
  this.latitude = lat;
  this.longitude = lon;
  this.idNum = num;
  this.edges = [];
  this.distance = 0;
  this.parent = null;
  this.visited = false;
  this.rootDistance = 0;
  this.targetDistance = 0;
  this.heuristicNum = 0;
}
function Edge(n1,n2,l){
  this.node1 = n1;
  this.node2 = n2;
  this.distance = l;
  this.getOther = function(n) {
    if(n.idNum === this.node1.idNum) {
      return this.node2;
    }
    else if(n.idNum === this.node2.idNum) {
      return this.node1;
    }
    else {
      return 0;
    }
  }
}
var nodeDict = {};
var allWays = [];
var nodesF = [];
var edgesF = [];
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      myFunction(this);
    }
};
xhttp.open("GET", "nuevaArea.xml", true);
xhttp.send();
function myFunction(xml) {
    var xmlDoc = xml.responseXML;
    var waysTemp = xmlDoc.getElementsByTagName("way");
    var filteredWaysDict = {};
    for(i = 0; i < waysTemp.length; i++){
      tags = waysTemp[i].getElementsByTagName("tag");
      for(j = 0; j < tags.length; j++){
        var attributeKey = tags[j].attributes.k.nodeValue;
        if(attributeKey==="highway"){
          if(tags[j].attributes.v.nodeValue.indexOf("motorway")===-1){
            filteredWaysDict[waysTemp[i].id] = waysTemp[i];
            break;
          }
        }
      }
    }
    var nodesTemp = xmlDoc.getElementsByTagName("node");
    var initialNodeDict = {};
    for(i = 0; i < nodesTemp.length; i++){ //Create a dictionary of all nodes on the map
      var currentNodeObject = new Node(nodesTemp[i].attributes.lat.nodeValue, nodesTemp[i].attributes.lon.nodeValue, nodesTemp[i].id);
      initialNodeDict[nodesTemp[i].id] = currentNodeObject;
    }
    for(i = 0; i < Object.keys(filteredWaysDict).length; i++){
      var currentWay = filteredWaysDict[Object.keys(filteredWaysDict)[i]];
      for(j = 0; j < currentWay.children.length; j++){
        if(currentWay.children[j].nodeName==="nd"){
          if(typeof nodeDict[currentWay.children[j].attributes[0].nodeValue] === "undefined"){
            var currentWayNode = currentWay.children[j];
            var currentWayNodeId = currentWayNode.attributes[0].nodeValue;
            nodeDict[currentWayNodeId] = new Node(initialNodeDict[currentWayNodeId].latitude,initialNodeDict[currentWayNodeId].longitude,currentWayNodeId);
          }
        }
      }
    }
    delete initialNodeDict;
    for(i = 0; i < Object.keys(filteredWaysDict).length; i++){
      var currentWay = filteredWaysDict[Object.keys(filteredWaysDict)[i]];
      var connectedNodes = [];
      for(j = 0; j < currentWay.children.length; j++){
        if(currentWay.children[j].nodeName==="nd"){
          connectedNodes.push(currentWay.children[j].attributes[0].nodeValue);
        }
      }
      //ConnectedNodes addition
      for(j = 0; j < connectedNodes.length - 1; j++){
        var node1 = nodeDict[connectedNodes[j]];
        var node2 = nodeDict[connectedNodes[j+1]];
        var nodeDistance = getDistance(node1.latitude, node1.longitude, node2.latitude, node2.longitude);
        var newEdge = new Edge(node1, node2, nodeDistance);
        node1.edges.push(newEdge);
        node2.edges.push(newEdge);
        edgesF.push(newEdge);
      }
    }
}
