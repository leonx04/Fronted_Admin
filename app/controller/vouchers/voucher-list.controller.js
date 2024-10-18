
app.controller('VouchersController', function ($scope, $http, $interval, $timeout) {
    // Khai báo các biến và hằng số
    const API_URL = "http://localhost:8080/api/admin/vouchers";
    let currentVoucherId = null;
    let updateInterval;

    // Khởi tạo các biến scope
    $scope.vouchers = [];
    $scope.searchParams = {};
    $scope.voucherData = {};
    $scope.isEditing = false;
    $scope.isLoading = false;
    $scope.isSearching = false;

    // Biến phân trang
    $scope.currentPage = 0;
    $scope.pageSize = 3;
    $scope.totalItems = 0;
    $scope.totalPages = 0;

    // Cấu hình toastr
    toastr.options = {
        "preventDuplicates": true,
        "closeButton": true,
        "progressBar": true,
    };

    // Hàm khởi tạo
    function init() {
        $scope.loadData(0);
    }

    // Hàm tải dữ liệu voucher
    $scope.loadData = function (page) {
        $scope.isLoading = true;
        $http.get(API_URL, {
            params: { page: page, size: $scope.pageSize }
        }).then(function (response) {
            updateVoucherData(response.data);
            startAutoUpdate();
        }).catch(handleError("Lỗi khi tải danh sách voucher"))
            .finally(() => $scope.isLoading = false);
    };

    // Hàm cập nhật dữ liệu voucher
    function updateVoucherData(data) {
        $scope.vouchers = data.content;
        $scope.currentPage = data.number;
        $scope.totalItems = data.totalElements;
        $scope.totalPages = data.totalPages;
    }

    // Hàm bắt đầu tự động cập nhật
    function startAutoUpdate() {
        if (updateInterval) {
            $interval.cancel(updateInterval);
        }
        updateInterval = $interval(function () {
            if (!$scope.isLoading && !$scope.isSearching) {
                $scope.loadData($scope.currentPage);
            }
        }, 5000);
    }

    // Hàm tìm kiếm voucher
    $scope.searchVouchers = function (page) {
        $scope.isLoading = true;
        $scope.isSearching = true;
        if (updateInterval) {
            $interval.cancel(updateInterval);
        }
        let params = { ...$scope.searchParams, page: page, size: $scope.pageSize };
        $http.get(API_URL + "/search", { params: params })
            .then(function (response) {
                updateVoucherData(response.data);
            })
            .catch(handleError("Lỗi khi tìm kiếm voucher"))
            .finally(() => $scope.isLoading = false);
    };

    // Hàm đặt lại form tìm kiếm
    $scope.resetForm = function () {
        $scope.searchParams = {};
        $scope.isSearching = false;
        $scope.loadData(0);
    };

    // Hàm thay đổi trang
    $scope.changePage = function (page) {
        if ($scope.isSearching) {
            $scope.searchVouchers(page);
        } else {
            $scope.loadData(page);
        }
    };

    // Hàm mở modal thêm voucher
    $scope.openAddModal = function () {
        $timeout(function () {
            $scope.isEditing = false;
            $scope.voucherData = {
                startDate: new Date(),
                endDate: new Date()
            };
        });
        $('#voucherModal').modal('show');
    };

    // Hàm mở modal chỉnh sửa voucher
    $scope.openEditModal = function (id) {
        $scope.isLoading = true;
        $http.get(API_URL + "/" + id)
            .then(function (response) {
                $scope.voucherData = angular.copy(response.data);
                $scope.voucherData.startDate = new Date($scope.voucherData.startDate);
                $scope.voucherData.endDate = new Date($scope.voucherData.endDate);
                currentVoucherId = id;
                $timeout(function () {
                    $scope.isEditing = true;
                    $('#voucherModal').modal('show');
                    $scope.$apply();
                });
            })
            .catch(handleError("Lỗi khi lấy thông tin voucher"))
            .finally(() => $scope.isLoading = false);
    };

    // Hàm lưu voucher (thêm mới hoặc cập nhật)
    $scope.saveVoucher = function () {
        $scope.isLoading = true;
        let url = $scope.isEditing ? API_URL + "/update/" + currentVoucherId : API_URL;
        let method = $scope.isEditing ? 'PUT' : 'POST';
        let successMessage = $scope.isEditing ? "Cập nhật voucher thành công!" : "Thêm voucher thành công!";

        let dataToSend = prepareVoucherData();

        $http({ 
            method: method, 
            url: url, 
            data: dataToSend 
        })
            .then(function (response) {
                $('#voucherModal').modal('hide');
                $scope.loadData($scope.currentPage);
                toastr.success(successMessage);
            })
            .catch(handleError("Lỗi khi lưu voucher"))
            .finally(() => $scope.isLoading = false);
    };

    // Hàm chuẩn bị dữ liệu voucher để gửi
    function prepareVoucherData() {
        let dataToSend = angular.copy($scope.voucherData);
        if (dataToSend.startDate) {
            dataToSend.startDate = dataToSend.startDate.toISOString();
        }
        if (dataToSend.endDate) {
            dataToSend.endDate = dataToSend.endDate.toISOString();
        }
        return dataToSend;
    }

    // Hàm xem chi tiết voucher
    $scope.viewVoucher = function (id) {
        $scope.isLoading = true;
        $http.get(API_URL + "/" + id)
            .then(function (response) {
                const voucher = response.data;
                const modalBody = document.getElementById("viewVoucherBody");
                modalBody.innerHTML = generateVoucherHtml(voucher);
                $('#viewVoucherModal').modal('show');
            })
            .catch(handleError("Lỗi khi lấy thông tin chi tiết voucher"))
            .finally(() => $scope.isLoading = false);
    };

    // Hàm tạo HTML cho chi tiết voucher
    function generateVoucherHtml(voucher) {
        return `
            <p><strong>Mã:</strong> ${voucher.code}</p>
            <p><strong>Mô tả:</strong> ${voucher.description}</p>
            <p><strong>Loại:</strong> ${$scope.getVoucherTypeDisplay(voucher.voucherType)}</p>
            <p><strong>Giá trị giảm:</strong> ${$scope.getDiscountValueDisplay(voucher)}</p>
            <p><strong>Ngày bắt đầu:</strong> ${new Date(voucher.startDate).toLocaleString()}</p>
            <p><strong>Ngày kết thúc:</strong> ${new Date(voucher.endDate).toLocaleString()}</p>
            <p><strong>Giá trị đơn hàng tối thiểu:</strong> ${$scope.formatCurrency(voucher.minimumOrderValue)}</p>
            <p><strong>Số tiền giảm tối đa:</strong> ${$scope.formatCurrency(voucher.maximumDiscountAmount)}</p>
            <p><strong>Số lượng:</strong> ${voucher.quantity}</p>
            <p><strong>Trạng thái:</strong> <span class="badge ${$scope.getStatusBadgeClass(voucher.status)}">${$scope.getStatusDisplay(voucher.status)}</span></p>
        `;
    }

    // Hàm mở modal xác nhận xóa
    $scope.openDeleteConfirmModal = function (id) {
        if (id) {
            $scope.currentVoucherId = id; // Thay đổi tên biến này
            console.log("Opening delete modal for voucher ID:", $scope.currentVoucherId);
            $('#deleteConfirmModal').modal('show');
        } else {
            toastr.error("Không thể xóa voucher. ID không hợp lệ!");
        }
    };

    // Update this function
    $scope.deleteVoucher = function () {
        $scope.isLoading = true;
        console.log("Deleting voucher with ID:", $scope.currentVoucherId);
        if (!$scope.currentVoucherId) {
            toastr.error("Không thể xóa voucher. ID không hợp lệ!");
            $scope.isLoading = false;
            return;
        }
        $http.delete(`${API_URL}/delete/${$scope.currentVoucherId}`)
            .then(function (response) {
                $('#deleteConfirmModal').modal('hide');
                $scope.loadData($scope.currentPage);
                toastr.success("Xóa voucher thành công!");
                $scope.currentVoucherId = null; // Reset sau khi xóa thành công
            })
            .catch(function (error) {
                console.error("Lỗi khi xóa voucher:", error);
                toastr.error("Lỗi khi xóa voucher: " + (error.data && error.data.message ? error.data.message : "Undefined error"));
            })
            .finally(() => $scope.isLoading = false);
    };

    // Hàm hiển thị loại voucher
    $scope.getVoucherTypeDisplay = function (type) {
        const typeMap = {
            "fixed": "Cố định",
            "freeship": "Miễn phí vận chuyển",
            "percentage": "Phần trăm"
        };
        return typeMap[type] || type;
    };

    // Hàm hiển thị giá trị giảm giá
    $scope.getDiscountValueDisplay = function (voucher) {
        if (voucher.voucherType === "fixed" || voucher.voucherType === "freeship") {
            return $scope.formatCurrency(voucher.discountValue);
        } else if (voucher.voucherType === "percentage") {
            return `${voucher.discountValue}%`;
        }
        return voucher.discountValue;
    };

    // Hàm hiển thị trạng thái voucher
    $scope.getStatusDisplay = function (status) {
        const statusMap = {
            0: "Đã hết",
            1: "Hoạt động",
            2: "Không hoạt động",
            3: "Chờ hoạt động",
            4: "Đã kết thúc"
        };
        return statusMap[status] || "Không xác định";
    };

    // Hàm lấy class cho badge trạng thái
    $scope.getStatusBadgeClass = function (status) {
        const classMap = {
            0: "badge-secondary",
            1: "badge-success",
            2: "badge-info",
            3: "badge-warning",
            4: "badge-danger"
        };
        return classMap[status] || "badge-warning";
    };

    // Hàm định dạng tiền tệ
    $scope.formatCurrency = function (amount) {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Hàm xử lý lỗi chung
    function handleError(errorMessage) {
        return function (error) {
            console.error(errorMessage + ":", error);
            toastr.error(errorMessage + "!");
        };
    }

    // Khởi tạo controller
    init();

    // Hủy interval khi controller bị hủy
    $scope.$on('$destroy', function () {
        if (updateInterval) {
            $interval.cancel(updateInterval);
        }
    });
});
