/* models */

Players = new Meteor.Collection('players');
Sessions = new Meteor.Collection('sessions');

Meteor.methods({
  
  //admin methods
  createSession: function(idSession, populationSize, groupSize, numberRounds, date, rule){
    Sessions.insert({idSession: idSession, populationSize: populationSize, groupSize: groupSize, groupCapacity: [], numberRounds: numberRounds, date: date, rule: rule});
    for(i = 0; i<(populationSize/groupSize)*numberRounds; i++){
      Sessions.update({idSession: idSession} ,{$push: {groupCapacity: groupSize}});
    }

    //create necessary users
    for(i = 0; i<populationSize; i++){
      var newIdPlayer = idSession.concat(i.toString());
      var randNumber = Math.floor((Math.random()*100)+1);
      var password = newIdPlayer.concat(randNumber.toString());
      Players.insert({idPlayer: newIdPlayer, idSession: idSession, timesPlayed: 0, pPlayed: [ ], qPlayed: [ ], reward: [], actualGroup: "", password: password, state: 0});
      var options = {username: newIdPlayer, password: password};
      Accounts.createUser(options);
    }
  },  
  
  createPlayer: function(idPlayer, idSession, password, state){
    Players.insert({idPlayer: idPlayer, idSession: idSession, timesPlayed: 0, pPlayed: [ ], qPlayed: [ ], reward: [],  actualGroup: "", password: password, state: state});
    var options = {username: idPlayer, password: password};
    Accounts.createUser(options);
  },
  
  saveStrategy : function(idPlayer,p,q){
    Players.update({idPlayer: idPlayer}, {$push: {pPlayed: p}});
    Players.update({idPlayer: idPlayer}, {$push: {qPlayed: q}});
    Players.update({idPlayer: idPlayer}, {$set: {state: 2}});
    return false;
  },
  
  computeOutcomeOfGame : function(idGroup){
  },
  
  incState : function(username){
    var actualState = Players.findOne({idPlayer : username}).state;
    var newState = (actualState+1)%4;
    console.log(newState);
    Players.update({idPlayer : username}, {$set: {state : newState}});
    return false;
  },

  updateRoundReward: function(username, idSession){
    var sessionRule = Sessions.findOne({idSession: idSession}).rule;
    var group = Players.findOne({idPlayer: username}).actualGroup;
    var groupMates = Players.find({actualGroup: group, idSession: idSession});
    var pp = [];
    var qq = [];
    var myP = 0;
    var myQ = 0;
    
    
    groupMates.forEach(function(g) {      
      if(g.idPlayer == username){
	myP=(g.pPlayed)[(g.pPlayed).length-1];
	myQ=(g.qPlayed)[(g.qPlayed).length-1];
      }
      else
      {
	pp.concat((g.pPlayed)[(g.pPlayed).length-1]);
	qq.concat((g.qPlayed)[(g.qPlayed).length-1]);
      }
    })
    
    Players.update({idPlayer: username},{$push: {reward: myP*3}});
    Players.update({idPlayer: username},{$set:  {state: 3}});
    return false;
  }
  
});
