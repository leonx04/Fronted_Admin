// Định nghĩa controller PromotionsController
app.controller('PromotionsController', function ($scope, $http, $interval, $timeout) {
    // Khai báo các biến và hằng số
    const API_URL = "http://localhost:8080/api/admin/promotions";
    const PAGE_SIZE = 3;
    const AUTO_UPDATE_INTERVAL = 3000; // 3 giây

    // Khởi tạo các biến scope
    $scope.promotions = [];
    $scope.searchParams = {};
    $scope.promotionData = {};
    $scope.isEditing = false;
    $scope.isLoading = false;
    $scope.isSearching = false;
    $scope.currentPage = 0;
    $scope.totalItems = 0;
    $scope.totalPages = 0;
    $scope.validationErrors = [];

    // Biến local
    let currentPromotionId = null;
    let updateInterval;

    // Cấu hình cho thông báo toastr
    toastr.options = {
        "preventDuplicates": true,
        "closeButton": true,
        "progressBar": true,
    };

    // Hàm tải dữ liệu khuyến mãi
    $scope.loadData = function (page, isAutoUpdate = false) {
        if (!isAutoUpdate) {
            $scope.isLoading = true;
        }
        $http.get(API_URL, {
            params: { page: page, size: PAGE_SIZE }
        }).then(function (response) {
            updateScope(response.data);
        }).catch(handleError("Lỗi khi tải danh sách khuyến mãi"))
            .finally(() => {
                if (!isAutoUpdate) {
                    $scope.isLoading = false;
                }
            });
    };

    // Hàm tìm kiếm khuyến mãi
    $scope.searchPromotions = function (page) {
        $scope.isLoading = true;
        $scope.isSearching = true;
        stopAutoUpdate();

        let params = { ...$scope.searchParams, page: page, size: PAGE_SIZE };
        $http.get(`${API_URL}/search`, { params: params })
            .then(function (response) {
                updateScope(response.data);
            })
            .catch(handleError("Lỗi khi tìm kiếm khuyến mãi"))
            .finally(() => $scope.isLoading = false);
    };

    // Hàm đặt lại form tìm kiếm
    $scope.resetForm = function () {
        $scope.searchParams = {};
        $scope.isSearching = false;
        $scope.loadData(0);
        startAutoUpdate();
    };

    // Hàm chuyển trang
    $scope.changePage = function (page) {
        if ($scope.isSearching) {
            $scope.searchPromotions(page);
        } else {
            $scope.loadData(page);
        }
    };

    // Hàm chỉnh sửa khuyến mãi
    $scope.editPromotion = function (id) {
        $scope.isEditing = true;
        $scope.isLoading = true;
        stopAutoUpdate();
        $http.get(`${API_URL}/${id}`)
            .then(function (response) {
                $scope.promotionData = {
                    ...response.data,
                    startDate: new Date(response.data.startDate),
                    endDate: new Date(response.data.endDate)
                };
                currentPromotionId = id;
                $('#PromotionModal').modal('show');
            })
            .catch(handleError("Lỗi khi lấy thông tin khuyến mãi"))
            .finally(() => $scope.isLoading = false);
    };

    // Cập nhật hàm validatePromotion
    $scope.validatePromotion = function () {
        $scope.validationErrors = []; // Reset lỗi

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

    // Thêm hàm hiển thị lỗi tuần tự
    function displayErrorsSequentially(index = 0) {
        if (index < $scope.validationErrors.length) {
            toastr.error($scope.validationErrors[index], '', {
                onHidden: function () {
                    // Hiển thị lỗi tiếp theo sau khi lỗi hiện tại đã ẩn
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
        let url = `${API_URL}/update/${currentPromotionId}`;
        let dataToSend = preparePromotionData();

        $http.put(url, dataToSend)
            .then(function (response) {
                $('#PromotionModal').modal('hide');
                $scope.loadData($scope.currentPage);
                toastr.success("Cập nhật khuyến mãi thành công!");
                startAutoUpdate();
            }).catch(handleError("Lỗi khi cập nhật khuyến mãi"))
            .finally(() => $scope.isLoading = false);
    };


    // Hàm mở modal xác nhận xóa
    $scope.openDeleteConfirmModal = function (id) {
        currentPromotionId = id;
        stopAutoUpdate();
        $('#deleteConfirmModal').modal('show');
    };

    // Hàm xóa khuyến mãi
    $scope.deletePromotion = function () {
        $scope.isLoading = true;
        $http.delete(`${API_URL}/delete/${currentPromotionId}`)
            .then(function (response) {
                $('#deleteConfirmModal').modal('hide');
                $scope.loadData($scope.currentPage);
                toastr.success("Xóa khuyến mãi thành công!");
                startAutoUpdate();
            })
            .catch(handleError("Lỗi khi xóa khuyến mãi"))
            .finally(() => $scope.isLoading = false);
    };

    // Hàm tạo mảng số trang để hiển thị
    $scope.getPageRange = function () {
        let start = Math.max(1, $scope.currentPage - 1);
        let end = Math.min($scope.totalPages - 2, $scope.currentPage + 1);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    // Hàm cập nhật dữ liệu scope từ response
    function updateScope(data) {
        $scope.promotions = data.promotions;
        $scope.currentPage = data.currentPage;
        $scope.totalItems = data.totalItems;
        $scope.totalPages = data.totalPages;
    }

    // Hàm xử lý lỗi chung
    function handleError(message) {
        return function (error) {
            console.error(message, error);
            toastr.error(message);
        };
    }

    // Hàm chuẩn bị dữ liệu khuyến mãi để gửi lên server
    function preparePromotionData() {
        let dataToSend = { ...$scope.promotionData };
        if (!$scope.isEditing) {
            delete dataToSend.status;
        }
        if (dataToSend.startDate) {
            dataToSend.startDate = dataToSend.startDate.toISOString();
        }
        if (dataToSend.endDate) {
            dataToSend.endDate = dataToSend.endDate.toISOString();
        }
        return dataToSend;
    }

    // Hàm bắt đầu tự động cập nhật
    function startAutoUpdate() {
        stopAutoUpdate(); // Đảm bảo không có interval đang chạy
        updateInterval = $interval(function () {
            $scope.loadData($scope.currentPage, true);
        }, AUTO_UPDATE_INTERVAL);
    }

    // Hàm dừng tự động cập nhật
    function stopAutoUpdate() {
        if (updateInterval) {
            $interval.cancel(updateInterval);
        }
    }

    // Khởi tạo: Tải dữ liệu ban đầu và bắt đầu tự động cập nhật
    $scope.loadData(0);
    startAutoUpdate();

    // Hủy interval khi controller bị hủy
    $scope.$on('$destroy', stopAutoUpdate);
});