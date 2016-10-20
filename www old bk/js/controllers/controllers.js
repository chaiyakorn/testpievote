var oauthApp = angular.module('oauthApp.controllers', []);
var getrespone;
var getid;
var canVote = true;
var ones=0;
oauthApp.controller('welcomeCtrl', function ($scope, $state, $cookieStore,$ionicPopup) {
    onDashboard = false;
            connectMicrogear();
    /**
     * SOCIAL LOGIN
     * Facebook and Google
     */
    // FB Login
    $scope.fbLogin = function () {
        FB.login(function (response) {
            if (response.authResponse) {
               getUserInfo(); 
                 connectMicrogear();
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
        }, {scope: 'email,user_photos,user_videos'});





        function getUserInfo() {
            // get basic info
            FB.api('/me', function (response) {
                console.log('Facebook Login RESPONSE: ' + angular.toJson(response));
                getrespone=response.name
                getid=response.id
                // get profile picture
                FB.api('/me/picture?type=normal', function (picResponse) {
                    console.log('Facebook Login RESPONSE picture: ' + picResponse.data.url);
                    response.imageUrl = picResponse.data.url;
                    // store data to DB - Call to API
                    // Todo
                    // After posting user data to server successfully store user data locally
                    var user = {};
                    user.name = response.name;
                    user.email = response.email;
                    if(response.gender) {
                        response.gender.toString().toLowerCase() === 'male' ? user.gender = 'M' : user.gender = 'F';
                    } else {
                        user.gender = '';
                    }
                    user.profilePic = picResponse.data.url;
                    $cookieStore.put('userInfo', user);
                    $state.go('dashboard');
                    

                });
            }
                 
            );

        }
    };
    // END FB Login
    $scope.phonelogin =function(){
        // alert("sss");
          $scope.data = {};

  // An elaborate, custom popup
  var myPopup = $ionicPopup.show({
    template: '<input type="tel"  ng-model="data.wifi" placeholder="Enter Your Phone number" >',
    title: 'Sign in with Phone number',
    scope: $scope,
    buttons: [
      { text: 'Cancel' },
      {
        text: '<b>Ok</b>',
        type: 'button-positive',
        onTap: function(e) {
          if (!$scope.data.wifi) {
            //don't allow the user to close unless he enters wifi password
            e.preventDefault();
          } else {
            return $scope.data.wifi;
          }
        }
      }
    ]
  });

  myPopup.then(function(res) {
    if (res) {
                console.log('Tapped!', res);
                try{
                    var num = res.match(/\d/g).length===10;
                }catch(error){
                        
                }
               if (num ) {
                            var user = {};
                                        user.name = res;
                                        getid=res
                                        getrespone=res
                                        user.profilePic="img/profile-pic-default.png"
                            $cookieStore.put('userInfo', user);
                            $state.go('dashboard');
                        }else{
                                     var alertPopup = $ionicPopup.alert({
                                                title: 'ผิดพลาด',
                                                template: 'กรุณากรอกเบอร์โทรศัพ 10 หลัก'
                                            });
                                }    
            }else{
         console.log('you Cancel');
                }
  });

  // $timeout(function() {
  //    myPopup.close(); //close the popup after 3 seconds for some reason
  // }, 3000);
        
    };
    
     
});
// .controller('genbouttonandonclick', function($scope, $window, $state, $cookieStore) {
//   // With the new view caching in Ionic, Controllers are only called
//   // when they are recreated or on app start, instead of every page change.
//   // To listen for when this page is active (for example, to refresh data),
//   // listen for the $ionicView.enter event:
//   //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  
// })

// Dashboard/Profile Controller
oauthApp.controller('dashboardCtrl', function ($scope, $window, $state, $cookieStore, $ionicPopup) {
    // $scope.items = ["NGT01 คุณนิยม","NGT02 คุณเบท","NGT03 คุณติ๊ง","NGT04 คุณโอ๋"];   //set button
    onDashboard = true;
    $scope.items = [];
    if(status == 0){ 
        connectMicrogear();
    }

    // Set user details
    $scope.user = $cookieStore.get('userInfo');
    
    // Logout user
       $window.onbeforeunload = function(e) {
             // Action
            console.log("window active "+e);
            alert(e);
             try{
                microgear.disconnect(); 
            }catch(error){
                 microgear.connect(APPID);
                 microgear.disconnect(); 
            }
             $cookieStore.remove("userInfo"); 
               $state.go('welcome'); 

        };

    $scope.addTeam = function(teamList){
        $scope.items = [];
        for(var i = teamList.length-2; i>=0; i--){
            $scope.items.push(teamList[i]);
        }
        if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
            $scope.$apply();
        }
    }

    $scope.logout = function () {
        if(status == 1){ 
            try{
                microgear.disconnect(); 
            }catch(error){
                 microgear.connect(APPID);
                 microgear.disconnect(); 
            }
        } 
        $cookieStore.remove("userInfo"); 
        $state.go('welcome'); 
        $window.location.reload(); 
    };
    // $scope.voteteame = function () {
    //     console.log("sending massage");
    //     var name=getrespone;
    //     console.log(getrespone);
    //      microgear.chat("server",name+"|"+"2");
    //     // console.log("server",getresponse+"|"+"1");
    // };



    $scope.set = function(index) {
        console.log("click on "+index);
        var name=getrespone;
        var id=getid;
        var onerror =false;
        console.log("ID: "+id+" name :"+getrespone+" vote :"+index);
         
        var confirmPopup = $ionicPopup.confirm({
            title: 'ยืนยันการโหวด',
            template: 'คุณต้องการจะโหวดให้ทีม ' + index+' ใช่หรือไม่ ?'
        });

        confirmPopup.then(function(res) {            
            if(res) {                  
                try{
                    microgear.chat("server",id+"|"+name+"|"+index);
                    $scope.items = [];
                    document.getElementById("voteStatus").innerHTML = "คุณได้ทำการโหวตเรียบร้อยแล้ว";
                    canVote = false;
                    console.log("sending massage"+id+"|"+name+"|"+index);
                }catch(ex){
                    onerror=true;
                    console.log("sending fail return to wait on click")
                }                                             
                if (onerror==false) {
                    console.log("sending successfully")
                    console.log('You are sure');
                    $scope.textshow = true;                      
                    var alertPopup = $ionicPopup.alert({
                        title: 'สถานะการโหวต',
                        template: 'ออกจากระบบอัตโนมัต'
                    });
                    alertPopup.then(function(res) {
                        if(res) {
                            console.log('You are vote confirm ');
                            microgear.disconnect();
                            $cookieStore.remove("userInfo"); 
                            $state.go('welcome'); 
                            $window.location.reload();
                        } 
                    }); 
                }                                                 
                                     
            } else {
                console.log(7);
            console.log('You are not sure');
         }
        
            
      });
        
    };

   


});
