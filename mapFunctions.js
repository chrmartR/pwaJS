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
  var modDistance = rLength/2;
  var queue = new priorityQueue();
  //on first run, all nodes should already have rootDistance = 0 and visited=false from initialization
  resetNodes();
  queue.addObj(root, 0);
  root.rootDistance = 0;
  root.visited = true;
  while(queue.size()>0){
    var eNode = queue.pop();
    for(var e in eNode.edges){ //select current node and iterate through edges
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
      oNode.visited = true; //mark as visited if not already, go through adding and setting queue
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
  return targetNodes;
}
function generateOutPath(start, target){
  var path = [];
  var q = new priorityQueue();
  resetNodes();
  start.rootDistance = 0;
  q.addObj(start, 0);
  start.visited = true;
  while(q.size()>0){
    var cNode = q.pop();
    if(cNode === target){
      console.log(target.rootDistance);
      var pmNode = target;
      path.push(pmNode);
      while(pmNode.parent !== null){
        pmNode = pmNode.parent;
        path.push(pmNode);
      }
      path.reverse();
      return path;
    }
    for(var e in cNode.edges){
      var cEdge = cNode.edges[e];
      var oNode = cEdge.getOther(cNode);
      if(oNode.visited){
        continue;
      }
      oNode.visited = true;
      var altDistance = cNode.distance + cEdge.distance;
      if(q.getIndexOf(oNode)===-1){
        q.addObj(oNode, Number.MAX_VALUE);
      }
      else if(altDistance > oNode.rootDistance){
					continue;
			}
      oNode.rootDistance=altDistance;
      oNode.parent = cNode;
      q.changePriority(oNode,-oNode.rootDistance);
    }
  }
  return path;
}
function generateCirclePath(start, length){ //circle path not working
  console.log("circlepathstart");
  var radius = length/(2*Math.PI);
  var latitudeLength = 111352.5;
  var longitudeLength = Math.cos(start.latitude * Math.PI/180) * 111320; //in meters
  var angle = Math.random() * 2 * Math.PI;
  var xDistance = Math.cos(angle) * radius;
  var yDistance = Math.sin(angle) * radius;
  var longitudeDegrees = xDistance/longitudeLength; //Distance / (distance per longitude) = longitude
  var latitudeDegrees = yDistance/latitudeLength;
  var cCenterLat = parseFloat(start.latitude) + latitudeDegrees;
  var cCenterLon = parseFloat(start.longitude) + longitudeDegrees;
  var shortestDistance = Infinity;
  var targetNode; //node halfway around the circle
  var preferredLat = cCenterLat + latitudeDegrees;
  var preferredLon = cCenterLon + longitudeDegrees;
  for (var nodeTag in nodeDict) {
    var distanceFromOpposite = getDistance(preferredLat, preferredLon, nodeDict[nodeTag].latitude, nodeDict[nodeTag].longitude);
    if(distanceFromOpposite<shortestDistance){
      shortestDistance = distanceFromOpposite;
      targetNode = nodeDict[nodeTag];
    }
  } //picked a target node and a circle
  markers.push(L.marker([cCenterLat, cCenterLon]).addTo(map));
  console.log("circleinit");
  var path = [];
  var q = new priorityQueue();
  var reachedHalf = false;
  resetNodes();
  start.rootDistance = 0;
  q.addObj(start, 0);
  start.visited = true;
  while(q.size()>0){
    var cNode = q.pop();
    //––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    if(cNode === targetNode){  //save path and exit
      if(reachedHalf){
        console.log("final="+targetNode.rootDistance);
        var pmNode = targetNode;
        var path2 = [];
        path2.push(pmNode);
        while(pmNode.parent !== null){
          pmNode = pmNode.parent;
          path2.push(pmNode);
        }
        path2.reverse();
        return path.concat(path2);
      }
      else{
        console.log("half = "+targetNode.rootDistance+", goal="+length);
        var halfDistance = targetNode.rootDistance;
        reachedHalf = true;
        var pmNode = targetNode;
        while(pmNode.parent !== null){
          pmNode = pmNode.parent;
          path.push(pmNode);
        }
        path.reverse();
        resetNodes();
        q.clear();
        targetNode.visited = true;
        targetNode.rootDistance = halfDistance;
        q.addObj(targetNode, 0);
        targetNode = start;
      }
    }//––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    for(var e in cNode.edges){ //for each edge, check unvisited node
      var cEdge = cNode.edges[e];
      var oNode = cEdge.getOther(cNode);
      if(oNode.visited){
        continue;
      }
      oNode.visited = true;
      //––––––––––––––––––––––––––––––––––––
      var latToCircle = Math.abs(oNode.latitude - cCenterLat);
      var lonToCircle = Math.abs(oNode.longitude - cCenterLon);
      var distanceToCenter = Math.sqrt(Math.pow((latToCircle * latitudeLength),2) + Math.pow((lonToCircle * longitudeLength),2));
      var squaredDistanceToCircle = Math.pow((distanceToCenter-radius),2);
      //––––––––––––––––––––––––––––––––––––
      var altDistance = cNode.rootDistance + cEdge.distance; //use heuristic in distance measuring to intentionally affect route
      if(q.getIndexOf(oNode)===-1){ //If the neighbor is not in the list, add it
        q.addObj(oNode, Number.MIN_VALUE);
      }
      else if(altDistance > oNode.rootDistance){//if the way of accessing the neighbor from the current node is longer, then skip it
					continue;
			} //otherwise, update the parent, rootdistance, and priority in the queue
      oNode.rootDistance = altDistance;
      oNode.parent = cNode;
      if(reachedHalf){
        var minDistance = Number.MAX_VALUE;
        for(var n in path){
          var pNode = path[n];
          var toNode = getDistance(cNode.latitude,cNode.longitude, pNode.latitude, pNode.longitude);
          if(toNode < minDistance){
            minDistance = toNode;
          }
        }
        if(minDistance === 0){
          console.log("samepath");
          q.changePriority(oNode,Number.MIN_VALUE);
          continue;
        }
        var pathCoeff = 1.0/(minDistance+0.001);
        //Pathcoeff determines how close the neighbor Node is to the closest node from the outbound path
        console.log(oNode.rootDistance+":"+Math.sqrt(squaredDistanceToCircle)+":"+100000*pathCoeff);
        q.changePriority(oNode,-oNode.rootDistance-50*Math.sqrt(squaredDistanceToCircle)-100000*pathCoeff);
      }
      else{
        q.changePriority(oNode,-oNode.rootDistance-Math.sqrt(squaredDistanceToCircle));
        //nodes that are closer to start are prioritized first, nodes closer to circle are prioritized first
      }
    }
  }
  return path;
}
