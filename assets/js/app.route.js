const app = angular.module('360SneakerApp', ['ngRoute']);

app.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'app/views/dashboard.html',
      controller: 'DashboardController'
    })
    .when('/home', {
      templateUrl: 'app/views/home.html',
      controller: 'HomeController'
    })
    .when('/sales', {
      templateUrl: 'app/views/sales.html',
      controller: 'SalesController'
    })
    .when('/orders-pending', {
      templateUrl: 'app/views/order/orders-pending.html',
      controller: 'OrdersPendingController'
    })
    .when('/orders-list', {
      templateUrl: 'app/views/order/orders-list.html',
      controller: 'OrdersListController'
    })
    .when('/products-list', {
      templateUrl: 'app/views/products/products-list.html',
      controller: 'ProductsController'
    })
    .when('/attributes-color', {
      templateUrl: 'app/views/products/atributes/attributes-color.html',
      controller: 'AttributesColorsController'
    })
    .when('/attributes-size', {
      templateUrl: 'app/views/products/atributes/attributes-size.html',
      controller: 'AttributesSizeController'
    })
    .when('/attributes-brand', {
      templateUrl: 'app/views/products/atributes/attributes-brand.html',
      controller: 'AttributesBrandController'
    })
    .when('/attributes-material', {
      templateUrl: 'app/views/products/atributes/attributes-material.html',
      controller: 'AttributesMaterialController'
    })
    .when('/attributes-sole', {
      templateUrl: 'app/views/products/atributes/attributes-sole.html',
      controller: 'AttributesSoleController'
    })
    .when('/attributes-category', {
      templateUrl: 'app/views/products/atributes/attributes-category.html',
      controller: 'AttributesCaegoryController'
    })
    .when('/promotions', {
      templateUrl: 'app/views/promotion/promotion-list.html',
      controller: 'PromotionsController'
    })
    .when('/vouchers', {
      templateUrl: 'app/views/vouchers/vouchers-list.html',
      controller: 'VouchersController'
    })
    .when('/employees', {
      templateUrl: 'app/views/staff/employees.html',
      controller: 'EmployeesController'
    })
    .when('/customers-list', {
      templateUrl: 'app/views/customers/customer-list.html',
      controller: 'CustomersListController'
    })
    .when('/customers-history', {
      templateUrl: 'app/views/customers/customer-history.html',
      controller: 'CustomersHistoryController'
    })
    .when('/404', {
      templateUrl: 'app/views/exception/404.html',
      controller: '404Controllers'
    })
    .when('/order-detail/:code', {
      templateUrl: 'app/views/order/orderdetails.html',
      controller: 'OrdersListController'
    })
    .otherwise({
      redirectTo: '/'
    });
});

app.run(['$rootScope', '$location', function ($rootScope, $location) {
  $rootScope.$on('$routeChangeSuccess', function () {
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