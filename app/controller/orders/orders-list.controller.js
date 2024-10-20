app.controller("OrdersListController", function ($scope, $http, $location) {
  $scope.orders = [];
  $scope.selectedOrderDetails = {};

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

  $scope.Orders();

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
    $location.path('/order-detail/' + code);
    $http.get("http://localhost:8080/api/orders/" + code).then(function (response) {
      
        $scope.selectedOrderDetails = response.data[0];
        console.log("Dữ liệu chi tiết đơn hàng:", response.data);
      
    
      for (var key in $scope.selectedOrderDetails) {
        if ($scope.selectedOrderDetails.hasOwnProperty(key)) {
            console.log(key + ": " + $scope.selectedOrderDetails[key]);
        }
    }

    }).catch(function (error) {
      console.error("Error fetching order by code:", error);
    })
  }
  $scope.goBack = function () {
    $location.path('/orders-list');
  }
  $scope.formatCurrency = function(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
 
});



