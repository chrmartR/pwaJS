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
function findRootNode(latitude,longitude){
  var closestDistance = Number.MAX_VALUE;
  var currentNode;
  for(var i in nodes){
    var n = nodes[i];
    var d = getDistance(latitude,longitude, n.latitude, n.longitude);
    if (d<closestDistance) {
      closestDistance = d;
      currentNode = n;
    }
  }
  return currentNode;
}
function findNodeUsables(root, distance, nodeList){
  var newNodes = [];
  for(var i in nodeList){
    var cNode = nodeList[i];
    if(getDistance(cNode.latitude, cNode.longitude,root.latitude, root.longitude)<distance/2){
      newNodes.push(cNode);
    }
  }
  return newNodes;
}
function findTargetNodes(root, rLength, nodeDictionary){
  var targetNodes = [];
  var modDistance = (Math.PI-2)*rLength/2;
  var queue = new priorityQueue();
  console.log(Object.keys(nodeDictionary).length);
  //on first run, all nodes should already have rootDistance = 0 and visited=false from initialization
  for(var nIndex in Object.values(nodeDictionary)){
    //time the attribute setting–
    
  }
  console.log("initialized")
  console.log("distance="+rLength+" mod="+modDistance);
  queue.addObj(root, 0);
  root.rootDistance = 0;
  while(queue.size()>0){
    var eNode = queue.pop();
    eNode.visited = true;   //select the current node and mark it as visited
    for(var e in eNode.edges){
      var cEdge = eNode.edges[e];
      var oNode = cEdge.getOther(eNode); //for each edge, find nearby node
      var altDistance = eNode.rootDistance + cEdge.distance;  //calculate the distance from the root to the other node (through the current)
      if(altDistance > oNode.rootDistance){ //if this distance is longer than the current length, skip this node
					continue;
			}
      oNode.rootDistance = altDistance;
      if(oNode.visited){
        continue;
      }
      if(oNode.rootDistance>modDistance&&eNode.rootDistance<modDistance){
        if((oNode.rootDistance-modDistance)<(modDistance-eNode.rootDistance)){
          if(targetNodes.indexOf(oNode)===-1){
            targetNodes.push(oNode);
          }
        }
        else{
          if(targetNodes.indexOf(eNode)===-1){
            targetNodes.push(eNode);
          }
        }
      }
      else{
        if(queue.getIndexOf(oNode)===-1){
          queue.addObj(oNode, Number.MAX_VALUE);
        }
      }
    }
  }
  console.log("targets found")
  return targetNodes;
}
