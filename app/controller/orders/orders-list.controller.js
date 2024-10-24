app.controller("OrdersListController", function ($scope, $http, $location, $timeout,$routeParams) {
  $scope.orders = [];
  $scope.selectedOrderDetails = [];

  $scope.pagination = {
    currentPage: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0
  };

  $scope.orderStatuses = [
    { id: '', name: 'Tất cả trạng thái' },
    { id: 'Đang chờ xử lý', name: 'Đang chờ xử lý' },
    { id: 'Đã xác nhận', name: 'Đã xác nhận' },
    { id: 'Đang giao hàng', name: 'Đang giao hàng' },
    { id: 'Hoàn thành', name: 'Hoàn thành' },
    { id: 'Đã hủy', name: 'Đã hủy' }
  ];

  $scope.orderTypes = [
    { id: '', name: 'Tất cả phương thức' },
    { id: 'Online', name: 'Online' },
    { id: 'Offline', name: 'Offline' }
  ];

  // Filter parameters
  $scope.filters = {
    status: '',
    orderType: ''
  };
  $scope.searchOrders = function() {
    $scope.pagination.currentPage = 0; 
    $scope.Orders(0);
  };
  $scope.resetFilters = function() {
    $scope.filters = {
      status: '',
      orderType: ''
    };
    $scope.searchOrders();
  };

  $scope.Orders = function (page) {
    $http
      .get(`http://localhost:8080/api/orders?page=${page}&size=${$scope.pagination.pageSize}`)
      .then(function (response) {
        // Update orders data
        $scope.orders = response.data.content;
        
        // Update pagination info
        $scope.pagination.currentPage = response.data.pageNo;
        $scope.pagination.pageSize = response.data.pageSize;
        $scope.pagination.totalElements = response.data.totalElements;
        $scope.pagination.totalPages = response.data.totalPages;
      })
      .catch(function (error) {
        console.error("Error fetching orders:", error);
      })
      
  };

  $scope.changePage = function(page) {
    if (page >= 0 && page < $scope.pagination.totalPages) {
      $scope.pagination.currentPage = page;
      $scope.Orders(page);
    }
  };

  $scope.getPageNumbers = function() {
    let pages = [];
    for(let i = 0; i < $scope.pagination.totalPages; i++) {
      pages.push(i);
    }
    return pages;
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
      $scope.Orders(0);
    }
  }
 
  init();

});