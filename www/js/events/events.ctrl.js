(function(){
  'use strict';
  angular.module('app')
    .controller('EventsCtrl', EventsCtrl);

  function EventsCtrl($scope, $window, $ionicPopover, $ionicScrollDelegate, EventSrv, EventUtils, Config, events){
    var nearPeriod = 10*24*60*60*1000;
    var vm = {};
    $scope.vm = vm;

    assignEvents(events);
    vm.emailSupport = Config.emailSupport;
    vm.showPastEvents = false;

    vm.doRefresh = doRefresh;
    vm.showPopover = function($event){ morePopover.show($event); };
    vm.togglePastEvents = togglePastEvents;
    vm.isNear = isNear;
    vm.tagColor = tagColor;
    vm.mapUrl = mapUrl;

    // refresh event list everytime it's loaded (once by app launch)
    // if it fails, we keep local data
    EventSrv.refreshEventList().then(function(events){
      assignEvents(events);
    });

    var morePopover;
    $ionicPopover.fromTemplateUrl('js/events/partials/events-popover.html', {
      scope: $scope
    }).then(function(popover) {
      morePopover = popover;
    });

    function doRefresh(){
      EventSrv.refreshEventList().then(function(events){
        assignEvents(events);
        $scope.$broadcast('scroll.refreshComplete');
      }, function(err){
        $scope.$broadcast('scroll.refreshComplete');
      });
    }
    function assignEvents(events){
      var eventsPartition = _.partition(events, function(event){ return EventUtils.isEventNow(event); });
      vm.runningEvents = eventsPartition[0];
      vm.events = eventsPartition[1];
    }
    function isNear(elt){
      return elt && elt.end+nearPeriod > Date.now();
    }
    function togglePastEvents(){
      vm.showPastEvents = !vm.showPastEvents;
      morePopover.hide();
      $ionicScrollDelegate.resize();
      if(!vm.showPastEvents){
        $ionicScrollDelegate.scrollTop(true);
      }
    }
    function tagColor(tag){
      if(tag === 'tech') return 'label-calm';
      if(tag === 'emploi') return 'label-energized';
      if(tag === 'business') return 'label-royal';
      return 'label-positive';
    }
    function mapUrl(address, height){
      if(!height){ height = 250; }
      return 'https://maps.googleapis.com/maps/api/staticmap?markers=color:red%7C'+address+'&zoom=15&size='+($window.innerWidth-20)+'x'+height;
    }
  }
})();
