app.directive('scrollToTop', function ($window) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.on('click', function () {
                $window.scrollTo(0, 0);
                scope.$apply();
            });

            angular.element($window).on('scroll', function () {
                if ($window.pageYOffset > 100) {
                    element.addClass('show');
                } else {
                    element.removeClass('show');
                }
                scope.$apply();
            });
        }
    };
});