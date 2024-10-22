app.controller("OrdersListController", function ($scope, $http, $location, $timeout,$routeParams) {
  $scope.orders = [];
  $scope.selectedOrderDetails = [];

  $scope.Orders = function () {
    $http
      .get("http://localhost:8080/api/orders")
      .then(function (response) {
        $scope.orders = response.data;
      })
      .catch(function (error) {
        console.error("Error fetching orders:", error);
      });
  };


  $scope.getStatusClass = function (status) {
    switch (status) {
      case "Đang chờ xử lý":
        return "status-pending";
      case "Đã xác nhận":
        return "status-confirmed";
      case "Đang giao hàng":
        return "status-shipping";
      case "Hoàn thành":
        return "status-completed";
      case "Đã hủy":
        return "status-canceled";
      default:
        return "";
    }
  };


  $scope.getOrderDetails = function (code) {
    $http
      .get("http://localhost:8080/api/orders/" + code)
      .then(function (response) {
        $timeout(function () {


          $scope.testVariable = "Test successful";


          $scope.selectedOrderDetails = response.data[0];
          console.log(response.data);
          $location.path('/order-detail/' + code); 
      })
      })
      .catch(function (error) {
        console.error("Error fetching order by code:", error);
      });
  };
  $scope.goBack = function () {
    $location.path('/orders-list');
  }
  $scope.formatCurrency = function (amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };


  function init(){
    if ($routeParams.code) {
      $scope.getOrderDetails($routeParams.code);
    } else {
      $scope.Orders();
    }
  }
 
  init();


});



