var myApp = angular.module('myApp', []);

myApp.config(function ($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
});


myApp.factory('authInterceptor', function ($rootScope, $q, $window) {
  return {
    request: function (config) {
      config.headers = config.headers || {};
      if ($window.sessionStorage.token) {
        config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
      }
      return config;
    },
    responseError: function (rejection) {
      if (rejection.status === 401) {
        // handle the case where the user is not authenticated
      }
      return $q.reject(rejection);
    }
  };
});


myApp.factory('AuthService', function ($rootScope, $http, $window, $q) {

    return {

        url_base64_decode: function (str) {
            var output = str.replace('-', '+').replace('_', '/');
            switch (output.length % 4) {
            case 0:
              break;
            case 2:
              output += '==';
              break;
            case 3:
              output += '=';
              break;
            default:
              throw 'Illegal base64url string!';
            }
            return window.atob(output); //polifyll https://github.com/davidchambers/Base64.js
            // base-64: atob decodes, btoa encodes
        },

        login: function (user) {
            var
            deferred = $q.defer(),
            self = this;
            $http
                .post('/authenticate', user)
                .success(function (data, status, headers, config) {
                    $window.sessionStorage.token = data.token;
                    $rootScope.isAuthenticated = true;
                    var encodedProfile = data.token.split('.')[1];
                    var profile = JSON.parse(self.url_base64_decode(encodedProfile));
                    deferred.resolve(profile);
                })
                .error(function (data, status, headers, config) {
                    // Erase the token if the user fails to log in
                    delete $window.sessionStorage.token;
                    $rootScope.isAuthenticated = false;
                    deferred.reject("Cannot Authenticate");
                });
            return deferred.promise;
        },

        logout: function () {
            $rootScope.isAuthenticated = false;
            delete $window.sessionStorage.token;
        }

    };
});


myApp.factory('DataService', function ($rootScope, $http, $window, $q) {
    return {

        getName: function () {
            var
            deferred = $q.defer();
            $http({url: '/api/restricted', method: 'GET'})
                .success(function (data, status, headers, config) {
                    deferred.resolve(data.name);
                })
                .error(function (data, status, headers, config) {
                    alert(data);
                });
            return deferred.promise;

        }

    };
});


myApp.controller('UserCtrl', function ($scope, AuthService, DataService) {

    $scope.submit = function () {
        AuthService.login($scope.user).then(
            function (profile) {
                $scope.welcome = 'Welcome ' + profile.first_name + ' ' + profile.last_name;
                $scope.error = '';
            },
            function () {
                $scope.welcome = '';
                $scope.error = 'Invalid username or password';
            }
        );
    };

    $scope.logout = function () {
        $scope.welcome = '';
        $scope.message = '';
        AuthService.logout()
    };

    $scope.callRestricted = function () {
        DataService.getName().then(function (name) {
            $scope.message = $scope.message + ' ' + name;
        });
    };

    init = function () {
        $scope.user = {username: 'john.doe', password: 'foobar'};
        $scope.welcome = '';
        $scope.message = '';
    }

    init();

});
