var oauthApp = angular.module('oauthApp.controllers', []);
var getrespone;
var getid;
var canVote = true;
oauthApp.controller('welcomeCtrl', function ($scope, $state,$window, $cookieStore,$ionicPopup) {

    onDashboard = false;
    console.log(" on controller");
   
    var str = window.location.href;
    console.log(" in tag "+str);
    var strsplit=str.split('#')
   
    if (strsplit[2]=="Facebook") {
        console.log("Facebook");
      var Facebookbutton =  document.getElementById("FBbt");
      Facebookbutton.style.visibility = "visible";
    }else if (strsplit[2]=="Phone") {
        console.log("Phone number");
      var phonenumber = document.getElementById("Pnbt");
      phonenumber.style.visibility = "visible";  
    }
        
    /* SOCIAL LOGIN
     * Facebook and Phone number
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
        }, {scope: 'user_photos,user_videos'});
        //{scope: 'email,user_photos,user_videos'});

        function getUserInfo() {
            // get basic info
            FB.api('/me', function (response) {
                console.log('Facebook Login RESPONSE: ' + angular.toJson(response));
                getrespone=response.name;
                getid=response.id;
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
    // Phone Login
    $scope.phonelogin =function(){
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
                // notting
        }
       if (num.length==10 ) {
            var user = {};
                    user.name = res;
                    user.email = res;
                    getid=res;
                    getrespone=res;
                    user.profilePic="img/profile-pic-default.png";
                    
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

    };
    // End Phone login
});

// Dashboard Controller
oauthApp.controller('dashboardCtrl', function ($scope, $window, $state, $cookieStore, $ionicPopup) {
    console.log("on dashboard");
    onDashboard = true;
    $scope.items = [];
    // if(status == 0){ 
    //     console.log("status is   "+status)
    //     connectMicrogear();
    // }

    // Set user details
    $scope.user = $cookieStore.get('userInfo');
    
    // auto Logout user
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
     // add team   
    $scope.addTeam = function(teamList){
        $scope.items = [];
        for(var i = teamList.length-2; i>=0; i--){
            $scope.items.push(teamList[i]);
        }
        if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
            $scope.$apply();
        }
    }
    // Logout user
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
