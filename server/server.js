Meteor.startup(function(){
  if(!Players.findOne({idPlayer: "admin"})){
    Meteor.call('createPlayer',"admin","nosession","admin",4);
  }
});


Meteor.methods({
  
  insertGroup: function(username, idSession){
    
    //values inserted by the player will be saved and their state will evolve
    
    //choose random number of group
    if(Players.findOne({idPlayer: username}).actualGroup == ""){
      var session = Sessions.findOne({idSession: idSession});
      var populationSize = session.populationSize;
      var groupSize = session.groupSize;
      var numberOfGroupsPerRound = populationSize/groupSize;
      var timesPlayed = Players.findOne({idPlayer: username}).timesPlayed;
      
      //get random between 0 and numberOfGroupsPerRound-1
      var randomGroup=Math.floor(Math.random()*numberOfGroupsPerRound) + (timesPlayed*numberOfGroupsPerRound);
      while((Sessions.findOne({idSession: idSession}).groupCapacity)[randomGroup] == 0){ 
	randomGroup=(randomGroup+1)%numberOfGroupsPerRound + (timesPlayed*numberOfGroupsPerRound);
      }
      
      //decrease capacity on session variable group capacity    
      var newArray = Sessions.findOne({idSession: idSession}).groupCapacity;
      newArray[randomGroup]=newArray[randomGroup]-1;
      Sessions.update({idSession: idSession}, {$set: {groupCapacity: newArray}});
      newArray = Sessions.findOne({idSession: idSession}).groupCapacity;
      
      //update actualGroup in player
      Players.update({idPlayer:username}, {$set: {actualGroup: randomGroup}});
      
      //ask for p and q
      Players.update({idPlayer:username}, {$set: {state: 1}});
    }
    
    return false;
  }
});