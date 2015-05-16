(function(){
  'use strict';
  angular.module('app')
    .factory('EventSrv', EventSrv)
    .factory('EventUtils', EventUtils);

  EventSrv.$inject = ['$q', '$http', 'UserSrv', 'EventUtils', 'DataUtils', 'StorageUtils', 'Config', '_'];
  function EventSrv($q, $http, UserSrv, EventUtils, DataUtils, StorageUtils, Config, _){
    var storageKey = 'events';
    function eventKey(eventId){ return storageKey+'-'+eventId; }
    function userDataKey(eventId){ return storageKey+'-'+eventId+'-userData'; }

    var service = {
      getAll: getAll,
      get: get,
      getExponent: getExponent,
      getSession: getSession,
      getUserData: getUserData,
      favoriteSession: function(elt){ return favorite(elt, 'sessions'); },
      unfavoriteSession: function(elt){ return unfavorite(elt, 'sessions'); },
      toggleFavoriteSession: function(eventData, elt){ return toggleFavorite(eventData, elt, 'sessions'); },
      favoriteExponent: function(elt){ return favorite(elt, 'exponents'); },
      unfavoriteExponent: function(elt){ return unfavorite(elt, 'exponents'); },
      toggleFavoriteExponent: function(eventData, elt){ return toggleFavorite(eventData, elt, 'exponents'); },
      refreshEventList: refreshEventList,
      refreshEvent: refreshEvent
    };
    return service;

    function getAll(){
      return DataUtils.getOrFetch(storageKey, '/events/all');
    }

    function get(eventId){
      var key = eventKey(eventId);
      return DataUtils.getOrFetch(key, '/events/'+eventId+'/full');
    }

    function getUserData(eventId){
      var key = userDataKey(eventId);
      return UserSrv.getUser().then(function(user){
        return DataUtils.getOrFetch(key, '/users/'+user.uuid+'/actions/'+eventId);
      });
    }

    function favorite(elt, eltType){
      var key = userDataKey(elt.eventId);
      return UserSrv.getUser().then(function(user){
        return $http.post(Config.backendUrl+'/events/'+elt.eventId+'/'+eltType+'/'+elt.uuid+'/favorites', {}, {headers: {userId: user.uuid}}).then(function(res){
          return getUserData(elt.eventId).then(function(eventData){
            if(!EventUtils.isFavorite(eventData, elt)){
              eventData.push(res.data);
              return StorageUtils.set(key, eventData).then(function(){
                return res.data;
              });
            } else {
              return $q.when(res.data);
            }
          });
        });
      });
    }

    function unfavorite(elt, eltType){
      var key = userDataKey(elt.eventId);
      return UserSrv.getUser().then(function(user){
        return $http.delete(Config.backendUrl+'/events/'+elt.eventId+'/'+eltType+'/'+elt.uuid+'/favorites', {headers: {userId: user.uuid}}).then(function(res){
          return getUserData(elt.eventId).then(function(eventData){
            _.remove(eventData, {itemId: elt.uuid, action: {favorite: true}});
            return StorageUtils.set(key, eventData);
          });
        });
      });
    }

    function toggleFavorite(eventData, elt, eltType){
      if(EventUtils.isFavorite(eventData, elt)){
        return unfavorite(elt, eltType).then(function(){
          EventUtils.removeFavorite(eventData, elt);
        });
      } else {
        return favorite(elt, eltType).then(function(favData){
          EventUtils.addFavorite(eventData, favData);
        });
      }
    }

    function getExponent(eventId, exponentId){
      return get(eventId).then(function(event){
        return _.find(event.exponents, {uuid: exponentId});
      });
    }

    function getSession(eventId, sessionId){
      return get(eventId).then(function(event){
        return _.find(event.sessions, {uuid: sessionId});
      });
    }

    function refreshEventList(){
      return DataUtils.refresh(storageKey, '/events/all');
    }

    function refreshEvent(eventId){
      var key = eventKey(eventId);
      return DataUtils.refresh(key, '/events/'+eventId+'/full');
    }
  }

  EventUtils.$inject = ['_'];
  function EventUtils(_){
    var service = {
      isFavorite: isFavorite,
      addFavorite: addFavorite,
      removeFavorite: removeFavorite,
      getComments: getComments
    };
    return service;

    function isFavorite(userData, elt){
      return _.find(userData, {itemId: elt.uuid, action: {favorite: true}}) !== undefined;
    }

    function addFavorite(userData, favData){
      userData.push(favData);
    }

    function removeFavorite(userData, elt){
      return _.remove(userData, {itemId: elt.uuid, action: {favorite: true}});
    }

    function getComments(userData, elt){
      return _.filter(userData, {itemId: elt.uuid, action: {comment: true}});
    }
  }
})();