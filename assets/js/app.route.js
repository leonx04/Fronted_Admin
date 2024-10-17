const app = angular.module('360SneakerApp', ['ngRoute']);

app.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'app/views/dashboard.html',
      controller: 'DashboardController',
      title: 'Dashboard'
    })
    .when('/home', {
      templateUrl: 'app/views/home.html',
      controller: 'HomeController',
      title: 'Trang Chủ'
    })
    .when('/sales', {
      templateUrl: 'app/views/sales.html',
      controller: 'SalesController',
      title: 'Bán Hàng'
    })
    .when('/orders-pending', {
      templateUrl: 'app/views/order/orders-pending.html',
      controller: 'OrdersPendingController',
      title: 'Đơn Hàng Chờ Xử Lý'
    })
    .when('/orders-list', {
      templateUrl: 'app/views/order/orders-list.html',
      controller: 'OrdersListController',
      title: 'Danh Sách Đơn Hàng'
    })
    .when('/products-list', {
      templateUrl: 'app/views/products/products-list.html',
      controller: 'ProductsController',
      title: 'Danh Sách Sản Phẩm'
    })
    .when('/attributes-color', {
      templateUrl: 'app/views/products/atributes/attributes-color.html',
      controller: 'AttributesColorsController',
      title: 'Thuộc Tính Màu Sắc'
    })
    .when('/attributes-size', {
      templateUrl: 'app/views/products/atributes/attributes-size.html',
      controller: 'AttributesSizeController',
      title: 'Thuộc Tính Kích Cỡ'
    })
    .when('/attributes-brand', {
      templateUrl: 'app/views/products/atributes/attributes-brand.html',
      controller: 'AttributesBrandController',
      title: 'Thuộc Tính Thương Hiệu'
    })
    .when('/attributes-material', {
      templateUrl: 'app/views/products/atributes/attributes-material.html',
      controller: 'AttributesMaterialController',
      title: 'Thuộc Tính Chất Liệu'
    })
    .when('/attributes-sole', {
      templateUrl: 'app/views/products/atributes/attributes-sole.html',
      controller: 'AttributesSoleController',
      title: 'Thuộc Tính Đế Giày'
    })
    .when('/attributes-category', {
      templateUrl: 'app/views/products/atributes/attributes-category.html',
      controller: 'AttributesCaegoryController',
      title: 'Thuộc Tính Thể Loại'
    })
    .when('/promotions', {
      templateUrl: 'app/views/promotion/promotion-list.html',
      controller: 'PromotionsController',
      title: 'Danh Sách Khuyến Mãi'
    })
    .when('/vouchers', {
      templateUrl: 'app/views/vouchers/vouchers-list.html',
      controller: 'VouchersController',
      title: 'Danh Sách Phiếu Giảm Giá'
    })
    .when('/employees', {
      templateUrl: 'app/views/staff/employees.html',
      controller: 'EmployeesController',
      title: 'Quản Lý Nhân Viên'
    })
    .when('/customers-list', {
      templateUrl: 'app/views/customers/customer-list.html',
      controller: 'CustomersListController',
      title: 'Danh Sách Khách Hàng'
    })
    .when('/customers-history', {
      templateUrl: 'app/views/customers/customer-history.html',
      controller: 'CustomersHistoryController',
      title: 'Lịch Sử Khách Hàng'
    })
    .when('/404', {
      templateUrl: 'app/views/exception/404.html',
      controller: '404Controllers',
      title: '404 Not Found'
    })
    .when('/add-promotion', {
      templateUrl: 'app/views/promotion/promotion-add.html',
      controller: 'AddPromotionController',
      title: 'Thêm Khuyến Mãi'
    })
    .otherwise({
      redirectTo: '/',
      title: '404 Not Found'
    });
});

app.run(['$rootScope', '$route', '$location', function ($rootScope, $route, $location) {
  $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
    // Cập nhật tiêu đề trang
    $rootScope.title = current.$$route ? current.$$route.title : '360 Sneaker';
    document.title = '360 Sneaker - ' + $rootScope.title;

    setTimeout(function () {
      // Xử lý nút toggle sidebar
      $('#sidebarToggleTop').off('click').on('click', function () {
        $('body').toggleClass('sidebar-toggled');
        $('.sidebar').toggleClass('toggled');
      });

      // Xử lý các submenu
      $('.nav-link.collapsed').off('click').on('click', function (e) {
        e.preventDefault();
        const $this = $(this);
        const target = $($this.data('target'));
        const currentPath = $location.path();
        const linkPath = $this.attr('href').replace('#!/', '');

        // Kiểm tra nếu đang ở trang hiện tại
        if (currentPath === '/' + linkPath) {
          // Nếu submenu đang mở, đóng nó
          if (!$this.hasClass('collapsed')) {
            $this.addClass('collapsed');
            target.collapse('hide');
          }
          // Nếu sidebar đang mở, đóng nó (tuỳ chọn)
          if (!$('body').hasClass('sidebar-toggled')) {
            $('body').addClass('sidebar-toggled');
            $('.sidebar').addClass('toggled');
          }
        } else {
          // Xử lý bình thường nếu không phải trang hiện tại
          $this.toggleClass('collapsed');
          target.collapse('toggle');
        }
      });

      // Đóng các submenu khác khi mở một submenu mới
      $('.nav-link[data-toggle="collapse"]').on('click', function () {
        $('.nav-link[data-toggle="collapse"]').not(this).addClass('collapsed');
        $('.collapse').not($(this).data('target')).collapse('hide');
      });

      // Đóng tất cả submenu khi đóng sidebar
      if ($('body').hasClass('sidebar-toggled')) {
        $('.nav-link.collapsed').addClass('collapsed');
        $('.collapse').collapse('hide');
      }
    }, 100);
  });
}]);