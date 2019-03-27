while(distanceTraveled<2000){
  currentNode.visited = true;
  path.push([currentNode.latitude, currentNode.longitude]);
  var neighborEdge = currentNode.edges[Math.floor(Math.random() * currentNode.edges.length)];
  distanceTraveled = distanceTraveled + neighborEdge.distance;
  var neighborNode = neighborEdge.getOther(currentNode);
  currentNode = neighborNode;
}
