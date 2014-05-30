Meteor.startup(function(){
  if(!Players.findOne({idPlayer: "admin"})){
    Meteor.call('createPlayer',"admin","nosession","admin64757");
  }
});

Accounts.config({
  forbidClientAccountCreation : true
});

Meteor.methods({
  
  insertGroup: function(username, idSession){
    return false;
  },
  
  prepareNextRound: function(username, idSession){
    return false;
  }  

});