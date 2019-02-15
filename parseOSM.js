var nodeDict = {};
var allWays = [];
var nodesF = [];
var waysF = [];
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
    var nodesDict = {};
    for(i = 0; i < nodesTemp.length; i++){
      nodesDict[nodesTemp[i].id] = nodesTemp[i];
    }
    console.log(filteredWaysDict[Object.keys(filteredWaysDict)[0]].children[0]);
    for(i = 0; i < Object.keys(filteredWaysDict).length; i++){
      var currentWay = filteredWaysDict[Object.keys(filteredWaysDict)[i]];
      var connectedNodes = [];
      for(j = 0; j < children.length; j++){
        
      }

    }
}
