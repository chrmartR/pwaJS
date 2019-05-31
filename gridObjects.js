function Node(lat,lon,num){
  this.latitude = lat;
  this.longitude = lon;
  this.idNum = num;
  this.edges = [];
  this.distance = 0;
  this.parent = null;
  this.visited = false;
  this.rootDistance = Number.MAX_VALUE;
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
function priorityQueue(){
  this.pItemList = [];
  this.pObjectList = [];
  function priorityItem(item,p){
    this.priority = p;
    this.node = item;
  }
  this.size = function(){
    return this.pItemList.length;
  }
  this.addObj = function(n,p){
    this.pItemList.push(new priorityItem(n,p));
    this.pObjectList.push(n);
  }
  this.pop = function(){  //pop with highest priority
    if(this.pItemList.length==0){
      return null;
    }
    var hPriority = Number.MIN_VALUE;
    var indexNum = 0;
    for(var i in this.pItemList){
      if(this.pItemList[i].priority>hPriority){
        hPriority = this.pItemList[i].priority;
        indexNum = i;
      }
    }
    var cNode = this.pItemList[indexNum].node;
    this.pItemList.splice(indexNum,1);
    this.pObjectList.splice(indexNum,1);
    return cNode;
  }
  this.changePriority = function(n, newP){
    for(var i in this.pItemList){
      if(this.pItemList[i]===n){
        this.pItemList[i].priority = newP;
        break;
      }
    }
  }
  this.getIndexOf = function(n){
    return this.pItemList.indexOf(n);
  }
  this.clear = function(){
    this.pItemList = [];
    this.pObjectList = [];
  }
}
