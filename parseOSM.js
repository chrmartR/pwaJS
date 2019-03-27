var nodeDict = {};
var edgeArray = [];
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      myFunction(this);
    }
};
xhttp.open("GET", "sanmateolarge.xml", true);
xhttp.send();
function myFunction(xml) {
    var xmlDoc = xml.responseXML;
    var waysTemp = xmlDoc.getElementsByTagName("way");
    var waysDict = {};
    for(i = 0; i < waysTemp.length; i++){
      tags = waysTemp[i].getElementsByTagName("tag");
      for(j = 0; j < tags.length; j++){
        var attributeKey = tags[j].attributes.k.nodeValue;
        if(attributeKey==="highway"){
          if(tags[j].attributes.v.nodeValue.indexOf("motorway")===-1){
            waysDict[waysTemp[i].id] = waysTemp[i];
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
    for(i = 0; i < Object.keys(waysDict).length; i++){
      var currentWay = waysDict[Object.keys(waysDict)[i]];
      for(j = 0; j < currentWay.children.length; j++){
        if(currentWay.children[j].nodeName==="nd"){
          if(typeof nodeDict[currentWay.children[j].attributes[0].nodeValue] === "undefined"){
            var currentWayNode = currentWay.children[j];
            var currentWayNodeId = currentWayNode.attributes[0].nodeValue;
            nodeDict[currentWayNodeId] = new Node(initialNodeDict[currentWayNodeId].latitude,initialNodeDict[currentWayNodeId].longitude,currentWayNodeId);;
          }
        }
      }
    }
    delete initialNodeDict;
    for(i = 0; i < Object.keys(waysDict).length; i++){
      var currentWay = waysDict[Object.keys(waysDict)[i]];
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
        edgeArray.push(newEdge);
      }
    }
}
