app.controller('AddPromotionController', function($scope, $http) {
    const API_URL = "http://localhost:8080/api/admin/promotions";

    $scope.promotionData = {};
    $scope.validationErrors = [];
    $scope.isLoading = false;

    // Configure toastr
    toastr.options = {
        "preventDuplicates": true,
        "closeButton": true,
        "progressBar": true,
    };

    $scope.validatePromotion = function () {
        $scope.validationErrors = []; // Reset errors

        if (!$scope.promotionData.code || $scope.promotionData.code.trim() === '') {
            $scope.validationErrors.push('Mã khuyến mãi không được để trống');
        }

        if (!$scope.promotionData.name || $scope.promotionData.name.trim() === '') {
            $scope.validationErrors.push('Tên khuyến mãi không được để trống');
        }

        if (!$scope.promotionData.startDate) {
            $scope.validationErrors.push('Ngày bắt đầu không được để trống');
        }

        if (!$scope.promotionData.endDate) {
            $scope.validationErrors.push('Ngày kết thúc không được để trống');
        }

        if ($scope.promotionData.startDate && $scope.promotionData.endDate) {
            if ($scope.promotionData.startDate >= $scope.promotionData.endDate) {
                $scope.validationErrors.push('Ngày kết thúc phải sau ngày bắt đầu');
            }
        }

        if ($scope.promotionData.discountPercentage === undefined || $scope.promotionData.discountPercentage === null) {
            $scope.validationErrors.push('Giá trị giảm giá không được để trống');
        } else {
            let discountValue = parseFloat($scope.promotionData.discountPercentage);
            if (isNaN(discountValue) || discountValue <= 0 || discountValue > 90) {
                $scope.validationErrors.push('Giá trị giảm giá phải là số dương và không vượt quá 90%');
            }
        }

        return $scope.validationErrors.length === 0;
    };

    function displayErrorsSequentially(index = 0) {
        if (index < $scope.validationErrors.length) {
            toastr.error($scope.validationErrors[index], '', {
                onHidden: function () {
                    $timeout(function () {
                        displayErrorsSequentially(index + 1);
                    }, 300);
                }
            });
        }
    }

    $scope.savePromotion = function () {
        if (!$scope.validatePromotion()) {
            displayErrorsSequentially();
            return;
        }

        $scope.isLoading = true;
        let dataToSend = preparePromotionData();

        $http.post(API_URL, dataToSend)
            .then(function (response) {
                toastr.success("Thêm khuyến mãi thành công!");
                $scope.promotionData = {}; // Reset form
            }).catch(handleError("Lỗi khi thêm khuyến mãi"))
            .finally(() => $scope.isLoading = false);
    };

    function preparePromotionData() {
        let dataToSend = { ...$scope.promotionData };
        if (dataToSend.startDate) {
            dataToSend.startDate = dataToSend.startDate.toISOString();
        }
        if (dataToSend.endDate) {
            dataToSend.endDate = dataToSend.endDate.toISOString();
        }
        return dataToSend;
    }

    function handleError(message) {
        return function (error) {
            console.error(message, error);
            toastr.error(message);
        };
    }
});