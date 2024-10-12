app.controller('PromotionsController', function($scope, $http, $interval) {
    
    // URL API để tương tác với backend
    const API_URL = "http://localhost:8080/api/admin/promotions";
    
    // Khởi tạo các biến và đối tượng trong scope
    $scope.promotions = [];          // Mảng chứa danh sách Promotion
    $scope.searchParams = {};      // Đối tượng chứa các tham số tìm kiếm
    $scope.promotionData = {};       // Đối tượng chứa dữ liệu của Promotion đang được thêm/sửa
    $scope.isEditing = false;      // Biến đánh dấu trạng thái đang chỉnh sửa hay thêm mới
    $scope.isLoading = false;      // Biến đánh dấu trạng thái đang tải dữ liệu
    $scope.isSearching = false;    // Biến đánh dấu trạng thái đang tìm kiếm
    
    let currentPromotionId = null;   // Biến lưu ID của Promotion đang được chỉnh sửa
    let updateInterval;            // Biến lưu interval để cập nhật dữ liệu tự động

    // Hàm tải dữ liệu ban đầu
    $scope.loadData = function() {
        $scope.isLoading = true;
        $http.get(API_URL)
            .then(function(response) {
                $scope.promotions = response.data;
                startAutoUpdate(); // Bắt đầu cập nhật tự động sau khi tải dữ liệu
            })
            .catch(function(error) {
                console.error("Lỗi khi tải danh sách Promotion:", error);
                toastr.error("Có lỗi khi lấy danh sách Promotion!");
            })
            .finally(function() {
                $scope.isLoading = false;
            });
    };

    // Hàm bắt đầu cập nhật tự động
    function startAutoUpdate() {
        // Hủy interval cũ nếu có
        if (updateInterval) {
            $interval.cancel(updateInterval);
        }
        // Tạo interval mới để cập nhật dữ liệu mỗi giây
        updateInterval = $interval(function() {
            // Chỉ cập nhật khi không đang tải dữ liệu và không đang tìm kiếm
            if (!$scope.isLoading && !$scope.isSearching) {
                $http.get(API_URL)
                    .then(function(response) {
                        $scope.promotions = response.data;
                    })
                    .catch(function(error) {
                        console.error("Lỗi khi cập nhật danh sách Promotion:", error);
                    });
            }
        }, 1000);
    }

     // Hàm tìm kiếm Promotion
     $scope.searchPromotions = function() {
        $scope.isLoading = true;
        $scope.isSearching = true;
        // Hủy cập nhật tự động khi đang tìm kiếm
        if (updateInterval) {
            $interval.cancel(updateInterval);
        }
        $http.get(API_URL + "/search", { params: $scope.searchParams })
            .then(function(response) {
                $scope.promotions = response.data;
            })
            .catch(function(error) {
                console.error("Lỗi khi tìm kiếm Promotion:", error);
                toastr.error("Có lỗi khi tìm kiếm Promotion!");
            })
            .finally(function() {
                $scope.isLoading = false;
            });
    };

    // Hàm đặt lại biểu mẫu tìm kiếm
    $scope.resetForm = function() {
        $scope.searchParams = {};
        $scope.isSearching = false;
        $scope.loadData(); // Tải lại dữ liệu và bắt đầu cập nhật tự động
    };

    // Hàm mở modal thêm mới Promotion
    $scope.openAddModal = function() {
        $scope.isEditing = false;
        $scope.promotionData = {};
        $('#PromotionModal').modal('show');
    };

    // Hàm chỉnh sửa Promotion
    $scope.editPromotion = function(id) {
        $scope.isEditing = true;
        $scope.isLoading = true;
        $http.get(API_URL + "/" + id)
            .then(function(response) {
                $scope.promotionData = response.data;
                // Chuyển đổi chuỗi ngày thành đối tượng Date
                $scope.promotionData.startDate = new Date($scope.promotionData.startDate);
                $scope.promotionData.endDate = new Date($scope.promotionData.endDate);
                currentPromotionId = id;
                $('#PromotionModal').modal('show');
            })
            .catch(function(error) {
                console.error("Lỗi khi lấy thông tin Promotion:", error);
                toastr.error("Có lỗi khi lấy thông tin Promotion!");
            })
            .finally(function() {
                $scope.isLoading = false;
            });
    };

    // Hàm lưu Promotion (thêm mới hoặc cập nhật)
    $scope.savePromotion = function() {
        $scope.isLoading = true;
        let url = API_URL;
        let method = 'POST';
        let dataToSend = { ...$scope.promotionData };

        if ($scope.isEditing) {
            url += "/update/" + currentPromotionId;
            method = 'PUT';
        } else {
            // Khi thêm mới, không gửi trường status
            delete dataToSend.status;
        }
        // Chuyển đổi ngày giờ sang định dạng ISO 8601
        if (dataToSend.startDate) {
            dataToSend.startDate = new Date(dataToSend.startDate).toISOString();
        }
        if (dataToSend.endDate) {
            dataToSend.endDate = new Date(dataToSend.endDate).toISOString();
        }
        $http({
            method: method,
            url: url,
            data: dataToSend
        }).then(function(response) {
            $('#PromotionModal').modal('hide');
            $scope.loadData();
            toastr.success("Lưu Promotion thành công!");
        }).catch(function(error) {
            console.error("Lỗi khi lưu Promotion:", error);
            toastr.error("Có lỗi khi lưu Promotion!");
        }).finally(function() {
            $scope.isLoading = false;
        });
    };


    // Hàm mở modal xác nhận xóa
    $scope.openDeleteConfirmModal = function(id) {
        currentPromotionId = id;
        $('#deleteConfirmModal').modal('show');
    };

    // Hàm xóa Promotion
    $scope.deletePromotion = function() {
        $scope.isLoading = true;
        $http.delete(API_URL + "/delete/" + currentPromotionId)
            .then(function(response) {
                $('#deleteConfirmModal').modal('hide');
                $scope.loadData();
                toastr.success("Xóa Promotion thành công!");
            })
            .catch(function(error) {
                console.error("Lỗi khi xóa Promotion:", error);
                toastr.error("Có lỗi khi xóa Promotion!");
            })
            .finally(function() {
                $scope.isLoading = false;
            });
    };


    // Hàm hỗ trợ: Hiển thị trạng thái Promotion
    $scope.getStatusDisplay = function(status) {
        switch (status) {
            case 0: return "Đã hết";
            case 1: return "Hoạt động";
            case 2: return "Không hoạt động";
            case 3: return "Chờ hoạt động";
            case 4: return "Đã kết thúc";
            default: return "Không xác định";
        }
    };

    // Hàm hỗ trợ: Lấy class cho badge trạng thái
    $scope.getStatusBadgeClass = function(status) {
        switch (status) {
            case 0: return "badge-secondary";
            case 1: return "badge-success";
            case 2: return "badge-info";
            case 3: return "badge-warning";
            case 4: return "badge-danger"
            default: return "badge-warning";
        }
    };

    // Khởi tạo: Tải dữ liệu ban đầu
    $scope.loadData();

    // Hủy interval khi controller bị hủy
    $scope.$on('$destroy', function() {
        if (updateInterval) {
            $interval.cancel(updateInterval);
        }
    });
});