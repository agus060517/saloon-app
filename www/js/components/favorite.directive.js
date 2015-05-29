(function(){
  'use strict';
  angular.module('app')
    .directive('favorite', favoriteDirective);

  function favoriteDirective($analytics, EventSrv, EventUtils){
    var directive = {
      restrict: 'E',
      templateUrl: 'js/components/favorite.html',
      scope: {
        userData: '=userData',
        elt: '=elt'
      },
      link: link
    };
    return directive;

    function link(scope, element, attrs){
      if(!checkParams(attrs)){ return; }
      var vm = {};
      scope.vm = vm;

      vm.favoriteLoading = false;

      vm.isFavorite = function(elt){ return EventUtils.isFavorite(scope.userData, elt); };
      vm.favorite = favorite;
      vm.unfavorite = unfavorite;

      function favorite(elt){
        if(!vm.favoriteLoading){
          vm.favoriteLoading = true;
          return EventSrv.favorite(elt).then(function(data){
            vm.favoriteLoading = false;
            EventUtils.setFavorite(scope.userData, data);
            $analytics.eventTrack('itemFavorited', {eventId: elt.eventId, itemType: elt.className, itemId: elt.uuid, itemName: elt.name});
          }, function(){
            vm.favoriteLoading = false;
          });
        }
      }

      function unfavorite(elt){
        if(!vm.favoriteLoading){
          vm.favoriteLoading = true;
          return EventSrv.unfavorite(elt).then(function(data){
            vm.favoriteLoading = false;
            EventUtils.setUnfavorite(scope.userData, data);
            $analytics.eventTrack('itemUnfavorited', {eventId: elt.eventId, itemType: elt.className, itemId: elt.uuid, itemName: elt.name});
          }, function(){
            vm.favoriteLoading = false;
          });
        }
      }
    }
  }

  function checkParams(attrs){
    if(!attrs.userData){ console.error('Directive "favorite" need a "userData" argument !'); return false; }
    if(!attrs.elt){ console.error('Directive "favorite" need a "elt" argument ! (session or exponent)'); return false; }
    return true;
  }
})();
