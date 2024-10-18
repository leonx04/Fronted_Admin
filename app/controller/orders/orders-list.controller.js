app.controller("OrdersListController", function ($scope, $http,$location) {
    $scope.orders = [];
    $scope.selectedOrderDetails= {};
  
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
  
  
      $scope.getOrderDetails = function(code){
        $location.path('/order-detail/' + code);
      }
      $scope.goBack = function(){
        $location.path('/orders-list');
      }
  });
    // $scope.getOrderDetails = function (code) {
    //   console.log("Gọi chi tiết đơn hàng với mã:", code);
    //   $http
    //     .get("http://localhost:8080/api/orders/" + code)
    //     .then(function (response) {
    //       $scope.selectedOrderDetails = response.data;
    //       console.log("Dữ liệu chi tiết đơn hàng:", response.data);
    //       const orderDetail = $scope.selectedOrderDetails[0];
    //       const modalBody = document.getElementById("orderDetailsBody");
    //       modalBody.innerHTML =
    //         `<p><strong>Mã đơn hàng:</strong> ${orderDetail.code}</p>
    //         <p><strong>Nhân viên:</strong> ${orderDetail.employee}</p>
    //       `;
    
    //       console.log("Selected Order Details:",$scope.selectedOrderDetails);
    //       console.log("Sắp mở modal");
    //       $("#myModal").modal("show");
    //     })
    //     .catch(function (error) {
    //       console.error("Error fetching order by code:", error);  
    //     }); 
    // };
  
  
  