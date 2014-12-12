// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services','app.directives'])

    .run(function($ionicPlatform,Loginservice,$state,$timeout,$http,Version,$ionicPopup) {
        $ionicPlatform.ready(function() {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if(window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if(window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }


        });

        document.addEventListener("deviceready", function(){
            Loginservice.init();
        }, false);
        document.addEventListener("resume", function(){
            Loginservice.init();
        }, false);

        var ifallowexit = false;
        // Disable BACK button on home
        $ionicPlatform.registerBackButtonAction(function (event) {

            if($state.current.name=="tab.friends"){
                if(ifallowexit){
                    navigator.app.exitApp();
                }
                else{
                    ifallowexit = true;
                    cordova.exec(function(str){

                    }, function(err) {
                        console.log(err);
                    }, "Showtoast", "showshort", ["再次点击返回键将退出应用"]);
                    $timeout(function(){
                        ifallowexit = false;
                    },1000);
                }
            }
            else {
                navigator.app.backHistory();
            }
        }, 100);

        $http.get("https://raw.githubusercontent.com/leochensh/dszh/master/README.md").success(function(data){
            var remoteVersion = parseFloat(data);
            if(remoteVersion-Version.getVersion()>0.05){
                var confirmPopup = $ionicPopup.confirm({
                    title: '版本升级',
                    template: '当前版本'+Version.getVersion()+'发现新版本'+remoteVersion+'，是否下载升级？'
                });
                confirmPopup.then(function(res) {
                    if(res) {
                        cordova.exec(function(str){
                        }, function(err) {
                            console.log(err);
                        }, "Updatedownload", "dowload", ["https://raw.githubusercontent.com/leochensh/dszh/master/dszh.apk"]);
                    } else {
                        console.log('You are not sure');
                    }
                });
            }
        });


    })

    .config(function($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            // setup an abstract state for the tabs directive
            .state('tab', {
                url: "/tab",
                abstract: true,
                templateUrl: "templates/tabs.html"
            })

            // Each tab has its own nav history stack:

            .state('tab.dash', {
                url: '/dash',
                views: {
                    'tab-dash': {
                        templateUrl: 'templates/tab-dash.html',
                        controller: 'DashCtrl'
                    }
                }
            })

            .state('tab.friends', {
                url: '/friends',
                views: {
                    'tab-friends': {
                        templateUrl: 'templates/tab-friends.html',
                        controller: 'FriendsCtrl'
                    }
                }
            })
            .state('tab.friend-detail', {
                url: '/friend/:id/:t',
                views: {
                    'tab-friends': {
                        templateUrl: 'templates/friend-detail.html',
                        controller: 'FriendDetailCtrl'
                    }
                }
            })

            .state('tab.account', {
                url: '/account',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/tab-account.html',
                        controller: 'AccountCtrl'
                    }
                }
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/friends');

    });

