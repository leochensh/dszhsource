
angular.module('starter.controllers', [])

    .controller('DashCtrl', function($scope) {
    })

    .controller('FriendsCtrl', function($scope,$scope,HttpClient,
                                        DSZHDatas,$ionicLoading,
                                        $ionicModal,Loginservice,faceData,
                                        $ionicActionSheet,Modalservice,
                                        $ionicPlatform,$state,$timeout) {




        var loginModal = Modalservice.loginModal($scope,function(realname,name,passwd){
            Loginservice.setLoginSuccess(realname,name,passwd);
        });



        var writeMsgModal = Modalservice.writeMsgModal($scope,0,0);


        $scope.writeMsg = function(){
            if(!Loginservice.ifLogin()){
                loginModal.show();
            }
            else{
                writeMsgModal.show();
            }

        };

        $scope.doRefresh = function(){
            DSZHDatas.getFullData(function(data){
                $scope.dsdata = data;
                $scope.$broadcast('scroll.refreshComplete');
            },true);
        };

        $scope.loadMore = function(){
            console.log(1);
//            $scope.$broadcast('scroll.infiniteScrollComplete');
            allowInfinite = false;
            DSZHDatas.loadMore(function(data){
                $scope.dsdata = data;
                $scope.$broadcast('scroll.infiniteScrollComplete');
                $timeout(function(){
                    allowInfinite = true;
                },2000);
            },function(){
                $scope.$broadcast('scroll.infiniteScrollComplete');
                $timeout(function(){
                    allowInfinite = true;
                },2000);
            });
        }
        var allowInfinite = false;
        DSZHDatas.getFullData(function(data){
            $scope.dsdata = data;
            $timeout(function(){
                allowInfinite = true;
            },2000);

        },false);

        $scope.allowinfinitescroll = function(){
            return allowInfinite;
        }

    })

    .controller('FriendDetailCtrl', function($scope, $stateParams,
                                             Friends,HttpClient,DSZHDatas,Loginservice,$scope,Modalservice) {
        var ttitle = DSZHDatas.getMsgTitle($stateParams.id);
        var t = $stateParams.t;
        var p = $stateParams.id;
        if(ttitle.length>15){
            $scope.title = ttitle.slice(0,15)+"...";
        }
        else{
            $scope.title = ttitle;
        }
        $scope.fulltitle = ttitle;

        var colorBorderArray = ["",
            "positive-border",
            "calm-border",
            "balanced-border",
            "energized-border",
            "assertive-border",
            "royal-border"
        ];
        var outArray = [];
        function generateFullArray(darray,level){
            var alength = colorBorderArray.length;
            for(var i in darray){
                if(level>=alength){
                    darray[i].classStr = "item  my-item "+colorBorderArray[alength-1];
                }
                else{
                    darray[i].classStr = "item  my-item "+colorBorderArray[level];
                }
                outArray.push(darray[i]);
                generateFullArray(darray[i].childmsg,level+1);
            }

        }
        DSZHDatas.getDetailInfo($stateParams.id,$stateParams.t,function(d){
            $scope.detail = d[0][1];
            outArray = [];
            generateFullArray(d[1],0);
            $scope.dsdata=outArray;


        },false);
        $scope.doRefresh = function(){
            DSZHDatas.getDetailInfo($stateParams.id,$stateParams.t,function(d){
                $scope.detail = d[0][1];
                outArray = [];
                generateFullArray(d[1],0);
                $scope.dsdata=outArray;
                $scope.$broadcast('scroll.refreshComplete');

            },true);
        };

        var loginModal = Modalservice.loginModal($scope,function(realname,name,passwd){
            Loginservice.setLoginSuccess(realname,name,passwd);
        });
        var writeMsgModal = Modalservice.writeMsgModal($scope,t,p);
        $scope.writeFeedback = function(){
            if(!Loginservice.ifLogin()){
                loginModal.show();
            }
            else{
                writeMsgModal.show();
            }
        }


    })

    .controller('DashCtrl', function($scope,Loginservice,Modalservice) {
        var loginModal = Modalservice.loginModal($scope,function(realname,name,passwd){
            Loginservice.setLoginSuccess(realname,name,passwd);
            $scope.loginInfo = Loginservice.getFullLoginInfo();
        });

        $scope.loginInfo = Loginservice.getFullLoginInfo();
        $scope.login = function(){
            loginModal.show();
        };

        $scope.logout = function(){
            Loginservice.logOut();
            $scope.loginInfo = Loginservice.getFullLoginInfo();
        };

        $scope.$watch("loginInfo.ifSave", function (val) {
            Loginservice.setIfsave(val);
        })

    });
