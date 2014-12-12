angular.module('starter.services', [])

/**
 * A simple example service that returns some data.
 */
    .factory('Friends', function() {
        // Might use a resource here that returns a JSON array

        // Some fake testing data
        var friends = [
            { id: 0, name: 'Scruff McGruff' },
            { id: 1, name: 'G.I. Joe' },
            { id: 2, name: 'Miss Frizzle' },
            { id: 3, name: 'Ash Ketchum' }
        ];

        return {
            all: function() {
                return friends;
            },
            get: function(friendId) {
                // Simple index lookup
                return friends[friendId];
            }
        }
    })
    .factory('HttpClient',function($http,Loginservice){
        var baseUrl = "http://dszh.org";
        return {
            getPageNum:function(pnum,successcb,failcb){
                $http.get(baseUrl+"/list.php?f=1&p="+pnum).
                    success(function(data, status, headers, config) {
                        successcb(data);
                    }).
                    error(function(data, status, headers, config) {
                        failcb();
                    });
            },
            getPageDetail:function(id,t,succb,failcb){
                $http.get(baseUrl+"/show.php?f=1&t="+t+"&m="+id).
                    success(function(data, status, headers, config) {
                        succb(data);
                    }).
                    error(function(data, status, headers, config) {
                        failcb();
                    });
            },
            doLogin:function(uname,passwd,succb,failcb){
//                alert("u="+uname+"&p="+passwd);
                $http({
                    method: 'POST',
                    url: baseUrl+"/login.php",
                    data: "u="+uname+"&p="+passwd,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function(data,status){
                    succb(data);
                }).error(function(data,status){
                    failcb();
                });

            },
            doSendMsg:function(t,p,title,body,submit,face,succb,failcb){
//                alert("u="+uname+"&p="+passwd);
                var uinfoarray = Loginservice.getLogininfo();
                var uname = uinfoarray[0];
                var passwd = uinfoarray[1];
                if(face == 0){
                    var fstr = "";
                }
                else{
                    var fstr = face;
                }
                var ustr = "u="+uname+"&p="+passwd+"&s="
                    +title+"&b="+body+"&e="+fstr
                    +"&submit="+submit;
//                alert(ustr);
                $http({
                    method: 'POST',
                    url: baseUrl+"/post.php?f=1&t="+t+"&p="+p,
                    data: ustr,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function(data,status){
                    succb(data);
                }).error(function(data,status){
                    failcb();
                });

            }
        }
    })
    .factory("DSZHDatas",function(HttpClient,$ionicLoading){
        var matchStr = /(var.*msgs\=\[\[.*?\]\];)/;

        var matchDetailMsgStr = /(var.*msg\=\[.*?\];)/;
        var originalArray;
        var parsedArray = [];
        var pendingMap = {};

        var idmsgmap = {};

        var detailMsgCache = {};
        var currentPage = 1;

        function processParseData(odata,earray,emap,testd1){
            console.log(odata);
            for(var i in odata){
                var d = odata[i];
//                console.log(d);
                if(!emap[d[0]]){
                    emap[d[0]] = {
                        id:d[0],
                        fatherid:d[1],
                        t:d[2],
                        title:d[4],
                        time:new Date(d[5]),
                        timestr:d[5],
                        sorttime:new Date(d[5]),
                        readcount:d[8],
                        author:d[9],
                        length:d[10],
                        childmsg:[]
                    };

                }
                else{
                    emap[d[0]].fatherid = d[1];
                    emap[d[0]].t = d[2];
                    emap[d[0]].title = d[4];
                    emap[d[0]].time = new Date(d[5]);
                    emap[d[0]].timestr = d[5];
                    emap[d[0]].sorttime = new Date(d[5]);

                    emap[d[0]].readcount = d[8];
                    emap[d[0]].author = d[9];
                    emap[d[0]].length = d[10];
                }
                if(d[6]){
                    emap[d[0]].logourl = "img/"+d[6]+".gif";
                }
                else{
                    emap[d[0]].logourl = "";
                }
                if(testd1(d) && !(_.findWhere(earray,{id:d[0]}))){
                    earray.push(emap[d[0]]);
                }
                else{
                    if(!emap[d[1]]){
                        emap[d[1]] = {
                            id:d[1],
                            childmsg:[]
                        };

                    }
                    emap[d[1]].childmsg.push(emap[d[0]]);
                }
            }
//            console.log(earray);
        }
        function JsonEscape(s)
        {
            var c;
            var dest="";

            for (var i in s)
            {
                c = s[i];
                if ((c == '\\') )
                {
                    dest += '\\';
                    dest += c;
                } else if (c == '\b') {
                    dest += "\\b";
                } else if (c == '\t') {
                    dest += "\\t";
                } else if (c == '\n') {
                    dest += "\\n";
                } else if (c == '\f') {
                    dest += "\\f";
                } else if (c == '\r') {
                    dest += "\\r";
                } else {
                    dest+=c;
                }
            }
            return dest;
        }
        var parseData = function(data){
//            data = data.replace(/'/g,'"');
//            data = data.replace(/\\/g,'');
//            data = data.replace(/\//g,'');
            var tr = data.match(matchStr);
            eval(tr[1]);
//            var pdata = JsonEscape(tr[1]);
//            console.log(pdata);
//            originalArray = JSON.parse(pdata);
//            alert(JSON.stringify(msgs));
            originalArray = msgs;

            processParseData(originalArray,parsedArray,idmsgmap,function(d){
                return d[1] == 0;
            })


        };

        var getDetailJson = function(data,id){
//            data = data.replace(/'/g,'"');
//            data = data.replace(/,\]/g,']');
            data = data.replace(/"\/upimg/g,'"http://dszh.org/upimg');
//            data = data.replace(/\\(?![rn\/"])/g,"");
//            data = data.replace(/\\r\\n/,'</br>');
            var tr = data.match(matchDetailMsgStr);
            eval(tr[1]);
            console.log(msg);
//            var pstr = tr[1].replace(/\\",/g,"\",")
//            console.log(pstr);
//            var jr = JSON.parse(pstr);
            var jr = msg;
            jr[1] = jr[1].replace(/\n/g,'<br/><br/>');

            var msgDetaiParsedArray = [];
            var msgIdMapTmp = {};

            var msgTr = data.match(matchStr);
            eval(msgTr[1]);
//            var detailArray = JSON.parse(msgTr[1]);
            var detailArray = msgs;
            console.log(msgDetaiParsedArray);
            processParseData(detailArray,msgDetaiParsedArray,msgIdMapTmp,function(d){

                return d[1] == id && d[0] != id && d[1]!=0;
            });


            for(var i in msgIdMapTmp){
                if(!idmsgmap[i]){
                    idmsgmap[i] = msgIdMapTmp[i];
                }
            }

            console.log(msgDetaiParsedArray);

            return [jr,msgDetaiParsedArray];
        };

        function showNetError(){
            cordova.exec(function(str){

            }, function(err) {
                console.log(err);
            }, "Showtoast", "show", ["Oops，网络连接似乎出问题了。"]);

        }
        return {
            parseData:parseData,

            loadMore:function(cb,cf){
                currentPage+=1;
                HttpClient.getPageNum(currentPage,function(data){

                    parseData(data);
                    cb(parsedArray);

                },function(){

                    showNetError();
                    cf();
                });
            },

            getFullData:function(callback,ifforceupdate){
                function remodePull(){
                    if(!ifforceupdate){
                        $ionicLoading.show({
                            template: 'Loading...'
                        });
                    }

                    HttpClient.getPageNum(1,function(data){
                        if(!ifforceupdate){
                            $ionicLoading.hide();
                        }

                        parseData(data);
                        callback(parsedArray);

                    },function(){
                        if(!ifforceupdate){
                            $ionicLoading.hide();
                        }
                       showNetError();
                    });
                }
                if(!ifforceupdate){
                    if(parsedArray.length == 0){
                        remodePull();
                    }
                    else{
                        callback(parsedArray);
                    }
                }
                else{
                    originalArray = [];
                    parsedArray = [];
                    idmsgmap = {};
                    remodePull();
                }


            },
            getDetailInfo:function(id,t,cb,ifforceupdate){
                function reload(){
                    if(!ifforceupdate){
                        $ionicLoading.show({
                            template: 'Loading...'
                        });
                    }

                    HttpClient.getPageDetail(id,t,function(data){
                        if(!ifforceupdate){
                            $ionicLoading.hide();
                        }

                        var cr = getDetailJson(data,id);
                        detailMsgCache[id] = cr;
                        cb(cr);
                    },function(){
                        if(!ifforceupdate){
                            $ionicLoading.hide();
                        }
                        showNetError();
                    });
                }
                if(!ifforceupdate){
                    if(detailMsgCache[id]){
                        cb(detailMsgCache[id]);
                    }
                    else{
                        reload();
                    }
                }
                else{
                    reload();
                }


            },
            getMsgTitle:function(id){
                if(idmsgmap[id]){
                    return idmsgmap[id].title;
                }
                else{
                    return "";
                }
            }
        }
    }).factory('Loginservice', function($http) {
        // Might use a resource here that returns a JSON array

        // Some fake testing data
        var ifSave = true;
        var ifLogin = false;
        var realname = "";
        var uname = "";
        var passwd = "";

        return {
            init:function(){
                var baseUrl = "http://dszh.org";
                var ld = localStorage.getItem("loginData");
                if(ld){
//                    alert(ld);
                    ld = JSON.parse(ld);
                    ifSave = ld.ifSave;
                    ifLogin = ld.ifLogin;
                    realname = ld.userName;
                    uname = ld.userNameEncoded;
                    passwd = ld.password;
                    $http({
                        method: 'POST',
                        url: baseUrl+"/login.php",
                        data: "u="+uname+"&p="+passwd,
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    }).success(function(data,status){

                    }).error(function(data,status){
//                        alert(JSON.stringify(data));
                        ifLogin = false;
                    });

                }
            },
            ifLogin:function(){
                return ifLogin;
            },
            setLoginSuccess:function(realu,u,p){
                ifLogin = true;
                realname = realu;
                uname = u;
                passwd = p;

                if(ifSave){
                    localStorage.setItem("loginData",JSON.stringify({
                        ifSave:ifSave,
                        ifLogin:ifLogin,
                        userName:realname,
                        userNameEncoded:uname,
                        password:passwd
                    }));
                }
            },
            logOut:function(){
                ifLogin = false;
                if(ifSave){
                    localStorage.setItem("loginData",JSON.stringify({
                        ifSave:ifSave,
                        ifLogin:ifLogin,
                        userName:realname,
                        userNameEncoded:uname,
                        password:passwd
                    }));
                }
            },
            getLogininfo:function(){
                return [uname,passwd];
            },
            getFullLoginInfo:function(){
                return {
                    ifSave:ifSave,
                    ifLogin:ifLogin,
                    userName:realname,
                    userNameEncoded:uname,
                    password:passwd
                };

            },
            setIfsave:function(ifs){
                ifSave = ifs;
                if(ifSave){
                    localStorage.setItem("loginData",JSON.stringify({
                        ifSave:ifSave,
                        ifLogin:ifLogin,
                        userName:realname,
                        userNameEncoded:uname,
                        password:passwd
                    }));
                }
            }
        }
    }).factory('faceData', function() {


        return {
            faces:{
                0:"无",
                1:"img/1.gif",
                2:"img/2.gif",
                3:"img/3.gif",
                4:"img/4.gif",
                5:"img/5.gif",
                6:"img/6.gif",
                7:"img/7.gif",
                8:"img/8.gif",
                9:"img/9.gif",
                10:"img/10.gif",
                11:"img/11.gif",
                12:"img/12.gif",
                13:"img/13.gif",
                14:"img/14.gif",
                15:"img/15.gif",
                16:"img/16.gif",
                17:"img/17.gif",
                18:"img/18.gif",
                21:"img/21.gif",
                23:"img/23.gif",
                25:"img/25.gif",
                27:"img/27.gif",
                29:"img/29.gif",
                31:"img/31.gif",
                33:"img/33.gif",
                35:"img/35.gif",
                37:"img/37.gif",
                38:"img/38.gif",
                39:"img/39.gif",
                40:"img/40.gif"
            }
        }
    }).factory('Modalservice', function($ionicModal,$ionicLoading,
                                        HttpClient,faceData,$ionicActionSheet) {


        return {
            loginModal:function(scope,cb){
                var _modal=null;
                var _scope = scope;
                $ionicModal.fromTemplateUrl('templates/loginmodal.html', {
                    scope: scope,
                    animation: 'slide-in-up'
                }).then(function(modal) {
                    _modal = modal;

                });
                _scope.cancelLogin = function(){
                    _modal.hide();
                };
                _scope.logindata = {};
                _scope.loginmsg = {ifError:false,msg:"test"};
                _scope.doLogin = function(){

                    if(_scope.logindata.username && _scope.logindata.password){
                        _scope.loginmsg.ifError = false;
                        $ionicLoading.show({
                            template: '正在登录...'
                        });
                        cordova.exec(function(str){
                            console.log(str);
                            HttpClient.doLogin(str,_scope.logindata.password,function(data){
                                console.log(data);
                                $ionicLoading.hide();
                                if(data.indexOf("请输入登陆数据")>=0){
                                    _scope.loginmsg.ifError = true;
                                    _scope.loginmsg.msg = "用户名或密码错误";
                                }
                                else{
                                    cb(_scope.logindata.username,
                                        str,_scope.logindata.password);
                                    _modal.hide();

                                }
                            });

                        }, function(err) {
                            console.log(err);
                        }, "URLEncoder", "echo", [_scope.logindata.username]);
                    }

                };
                return {
                    show:function(){
                        if(_modal){
                            _modal.show();
                        }

                    },
                    hide:function(){
                        if(_modal){
                            _modal.hide();

                        }

                    }
                }
            },
            writeMsgModal:function(scope,t,p){
                var _modalMsg=null;
                var _modalFace = null;
                var _scope = scope;
                $ionicModal.fromTemplateUrl('templates/writemsgmodal.html', {
                    scope: _scope,
                    animation: 'slide-in-up'
                }).then(function(modal) {
                    _modalMsg = modal;
                });

                $ionicModal.fromTemplateUrl('templates/facemodal.html', {
                    scope: _scope,
                    animation: 'slide-in-up'
                }).then(function(modal) {
                    _modalFace = modal;
                });

                _scope.sendmsg = {
                    face:""
                }
                _scope.faceselection={};
                _scope.faceselection.facechoice = 0;

                _scope.faceselection.faces = faceData.faces;
                _scope.faceselection.facenum = _.keys(faceData.faces);
                _scope.faceselection.faceimg = _.values(faceData.faces);


                _scope.confirmChoose = function(){
                    _scope.sendmsg.face = faceData.faces[_scope.faceselection.facechoice];
//                    alert(_scope.sendmsg.face);
                    _modalFace.hide();
                };
                _scope.cancelChoose = function(){
                    _modalFace.hide();
                };

                _scope.cancelSend = function(){
                    _modalMsg.hide();
                };
                _scope.chooseFace = function(){
                    _modalFace.show();
                };
                function appendImg(r){
                    var mr = r.match(/src\="([^"]*)"/);
                    var isrc = "<img src=\""+mr[1]+"\"/>";
                    if(_scope.sendmsg.body){
                        _scope.sendmsg.body+=isrc;
                    }
                    else{
                        _scope.sendmsg.body = isrc;
                    }
                }
                _scope.insertImage = function(){
                    var hideSheet = $ionicActionSheet.show({
                        buttons: [
                            { text: '拍照' },
                            { text: '相册' }
                        ],

                        titleText: '插入图片',
                        cancelText: '取消',
                        cancel: function() {
                            // add cancel code..
                        },
                        buttonClicked: function(index) {
                            if(index == 0){
                                navigator.camera.getPicture(function(imageUri){
                                        $ionicLoading.show({
                                            template: '图片上传中...'
                                        });
                                        var options = new FileUploadOptions();
                                        options.fileKey = "upfile";
                                        var ft = new FileTransfer();
                                        ft.upload(imageUri,
                                            encodeURI("http://dszh.org/upimg.php"),
                                            function (r) {
                                                console.log("Code = " + r.responseCode);
                                                console.log("Response = " + r.response);
                                                console.log("Sent = " + r.bytesSent);
//                                        alert(r.response);
                                                $ionicLoading.hide();
                                                appendImg(r.response);
                                            }, function(){
                                                $ionicLoading.hide();
                                            }, options);

                                    }, function(){},
                                    {quality: 25,
                                        sourceType : Camera.PictureSourceType.CAMERA,
                                        destinationType: Camera.DestinationType.FILE_URI,
                                        targetWidth: 1024,
                                        targetHeight: 1024});
                            }
                            if(index == 1){
                                navigator.camera.getPicture(function(imageUri){
                                        $ionicLoading.show({
                                            template: '图片上传中...'
                                        });
                                        var options = new FileUploadOptions();
                                        options.fileKey = "upfile";
                                        var ft = new FileTransfer();
                                        ft.upload(imageUri,
                                            encodeURI("http://dszh.org/upimg.php"),
                                            function (r) {
                                                console.log("Code = " + r.responseCode);
                                                console.log("Response = " + r.response);
                                                console.log("Sent = " + r.bytesSent);
//                                        alert(r.response);
                                                $ionicLoading.hide();
                                                appendImg(r.response);
                                            }, function(){
                                                $ionicLoading.hide();
                                            }, options);

                                    }, function(){},
                                    {quality: 25,
                                        sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
                                        destinationType: Camera.DestinationType.FILE_URI,
                                        targetWidth: 1024,
                                        targetHeight: 1024});
                            }
                            return true;
                        }
                    });
                };
                _scope.doSend = function(){
                    var title = _scope.sendmsg.title;
                    var body = _scope.sendmsg.body;
                    var face = _scope.faceselection.facechoice;
                    title = title?title:"";
                    body = body?body:"";


                    if(title || body){
                        $ionicLoading.show({
                            template: '帖子发布中...'
                        });
                        cordova.exec(function(str){
                            HttpClient.doSendMsg(t,p,str[0],str[1],str[2],face,function(d){
                                $ionicLoading.hide();
                                _modalMsg.hide();
                            });
                        }, function(err) {
                            console.log(err);
                            $ionicLoading.hide();
                            _modalMsg.hide();
                        }, "URLEncoder", "arrayencode", [3,title,body,"提交至论坛"]);
                    }
                };
                return {
                    show:function(){
                        _modalMsg.show();
                    }
                }
            }
        }
    }).factory('Version', function() {
        var version = 0.2;

        return {
            getVersion:function(){
                return version;
            }
        }
    });
