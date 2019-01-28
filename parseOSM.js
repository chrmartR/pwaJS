var fs = require('fs'),
    xml2js = require('xml2js');
var parser = new xml2js.Parser();
var nodeDict = {};
var allWays = [];
var nodesF = [];
var waysF = [];
fs.readFile('mapFiles/nuevaArea.xml', function(err, data) {
    parser.parseString(data, function (err, r) {
      //RECORD ALL THE NODES
      for (var index in r.osm.node) {
          var nodeID = r.osm.node[index].$.id;
          var nodeLat = r.osm.node[index].$.lat;
          var nodeLon = r.osm.node[index].$.lon;
          if(nodeDict[nodeID]===undefined){
            nodeDict[nodeID] = [nodeLat, nodeLon];
          }
      }
      console.log('Nodes Gathered');
      //RECORD ALL THE WAYS
      for (var index in r.osm.way) {
          var waytags = r.osm.way[index].tag;
          if(waytags == undefined){
            continue;
          }
          var isHighway = false;
          var isMotorway = false;
          for (var tagIndex in waytags) {
            if (waytags[tagIndex].$.k == "highway"){
              isHighway = true;
              roadType = waytags[tagIndex].$.v;
              if (roadType.includes("motorway")){
                isMotorway = true;
              }
            }
          }
          if(!isHighway||isMotorway){
            continue;
          }
          allWays.push(r.osm.way[index]);

      }
      console.log('Ways Gathered');
      //PROCESS AND CREATE GRID
      var nodeIDList = [];
      for (var windex in allWays) {
        var currentWay = allWays[windex]; //get way
        var wayNodeList = currentWay.nd; //get list of nodes in way
        var lastNode;
        for (var nindex in wayNodeList) { //iterate through nodes
          var cNode;
          var cWayNode = wayNodeList[nindex]; //find node in way format, only id
          var cNodeId = cWayNode.$.ref; //find id number
          var cNodeIndex = nodeIDList.indexOf(cNodeId);
          if(cNodeIndex==-1){ //If not created before, create and add to list
            var cNodeLatLn = nodeDict[cNodeId]; //find coordinates
            cNode = new node(cNodeLatLn[0],cNodeLatLn[1],cNodeId);
            nodeIDList.push(cNodeId);
            nodesF.push(cNode);
          }
          else{ //If created before, pull out of list
            cNode = nodesF[cNodeIndex]; //use dictionary later
          }
          if(nindex == 0){
            lastNode = cNode;
            continue;
          }
          var nodeDistance = getDistance(lastNode.latitude,lastNode.longitude,cNode.latitude,cNode.longitude);
          var newPath = new path(lastNode, cNode, nodeDistance);
          lastNode.edges.push(newPath);
          cNode.edges.push(newPath);
          waysF.push(newPath);
        }
      }
      console.log('Paths, Nodes Created');
      console.log(waysF)
    });
});
