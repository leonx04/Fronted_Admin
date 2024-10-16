<<<<<<< HEAD
// Định nghĩa controller PromotionsController
app.controller('PromotionsController', function ($scope, $http, $interval) {
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

    // Hàm lưu khuyến mãi (thêm mới hoặc cập nhật)
    $scope.savePromotion = function () {
        $scope.isLoading = true;
        let url = $scope.isEditing ? `${API_URL}/update/${currentPromotionId}` : API_URL;
        let method = $scope.isEditing ? 'PUT' : 'POST';
        let dataToSend = preparePromotionData();

        $http({
            method: method,
            url: url,
            data: dataToSend
        }).then(function (response) {
            $('#PromotionModal').modal('hide');
            $scope.loadData($scope.currentPage);
            toastr.success("Lưu khuyến mãi thành công!");
            startAutoUpdate();
        }).catch(handleError("Lỗi khi lưu khuyến mãi"))
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

    // Hàm mở modal thêm mới khuyến mãi
    $scope.openAddModal = function() {
        $scope.isEditing = false;
        $scope.promotionData = {};
        stopAutoUpdate();
        $('#PromotionModal').modal('show');
    };

    // Hàm hỗ trợ: Hiển thị trạng thái khuyến mãi
    $scope.getStatusDisplay = function (status) {
        const statusMap = {
            1: "Hoạt động",
            2: "Không hoạt động",
            3: "Chờ hoạt động",
            4: "Đã kết thúc"
        };
        return statusMap[status] || "Không xác định";
    };

    // Hàm hỗ trợ: Lấy class cho badge trạng thái
    $scope.getStatusBadgeClass = function (status) {
        const classMap = {
            1: "badge-success",
            2: "badge-info",
            3: "badge-warning",
            4: "badge-danger"
        };
        return classMap[status] || "badge-secondary";
    };

    // Hàm tạo mảng số trang để hiển thị
    $scope.getPageRange = function() {
        let start = Math.max(1, $scope.currentPage - 1);
        let end = Math.min($scope.totalPages - 2, $scope.currentPage + 1);
        return Array.from({length: end - start + 1}, (_, i) => start + i);
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
        return function(error) {
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
        updateInterval = $interval(function() {
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
=======
>>>>>>> 5e67c745a8ab34bec8365e8eeb8447961fcfb9b8
