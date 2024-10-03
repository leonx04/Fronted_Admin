app.controller('VouchersController', function ($scope, $http, $interval) {
    const API_URL = "http://localhost:8080/api/admin/vouchers";
    $scope.vouchers = [];
    $scope.searchParams = {};
    $scope.voucherData = {};
    $scope.isEditing = false;
    $scope.isLoading = false;
    let currentVoucherId = null;

    // Tải dữ liệu ban đầu
    $scope.loadData = function() {
        $scope.isLoading = true;
        $http.get(API_URL)
            .then(function(response) {
                $scope.vouchers = response.data;
            })
            .catch(function(error) {
                console.error("Lỗi khi tải danh sách voucher:", error);
                toastr.error("Có lỗi khi lấy danh sách voucher!");
            })
            .finally(function() {
                $scope.isLoading = false;
            });
    };

    // Cập nhật dữ liệu mỗi giây
    $interval(function() {
        if (!$scope.isLoading) {
            $http.get(API_URL)
                .then(function(response) {
                    $scope.vouchers = response.data;
                })
                .catch(function(error) {
                    console.error("Lỗi khi cập nhật danh sách voucher:", error);
                });
        }
    }, 1000);

    // Tìm kiếm voucher
    $scope.searchVouchers = function() {
        $scope.isLoading = true;
        $http.get(API_URL + "/search", { params: $scope.searchParams })
            .then(function(response) {
                $scope.vouchers = response.data;
            })
            .catch(function(error) {
                console.error("Lỗi khi tìm kiếm voucher:", error);
                toastr.error("Có lỗi khi tìm kiếm voucher!");
            })
            .finally(function() {
                $scope.isLoading = false;
            });
    };

    // Đặt lại biểu mẫu tìm kiếm
    $scope.resetForm = function() {
        $scope.searchParams = {};
        $scope.loadData();
    };

    // Mở modal thêm mới
    $scope.openAddModal = function() {
        $scope.isEditing = false;
        $scope.voucherData = {};
        $('#voucherModal').modal('show');
    };

    // Chỉnh sửa voucher
    $scope.editVoucher = function(id) {
        $scope.isEditing = true;
        $scope.isLoading = true;
        $http.get(API_URL + "/" + id)
            .then(function(response) {
                $scope.voucherData = response.data;
                $scope.voucherData.startDate = new Date($scope.voucherData.startDate);
                $scope.voucherData.endDate = new Date($scope.voucherData.endDate);
                currentVoucherId = id;
                $('#voucherModal').modal('show');
            })
            .catch(function(error) {
                console.error("Lỗi khi lấy thông tin voucher:", error);
                toastr.error("Có lỗi khi lấy thông tin voucher!");
            })
            .finally(function() {
                $scope.isLoading = false;
            });
    };

    // Lưu voucher (thêm mới hoặc cập nhật)
    $scope.saveVoucher = function() {
        $scope.isLoading = true;
        let url = API_URL;
        let method = 'POST';
        let dataToSend = { ...$scope.voucherData };

        if ($scope.isEditing) {
            url += "/update/" + currentVoucherId;
            method = 'PUT';
        } else {
            // Khi thêm mới, không gửi trường status
            delete dataToSend.status;
        }

        $http({
            method: method,
            url: url,
            data: dataToSend
        }).then(function(response) {
            $('#voucherModal').modal('hide');
            $scope.loadData();
            toastr.success("Lưu voucher thành công!");
        }).catch(function(error) {
            console.error("Lỗi khi lưu voucher:", error);
            toastr.error("Có lỗi khi lưu voucher!");
        }).finally(function() {
            $scope.isLoading = false;
        });
    };

    // Xem chi tiết voucher
    $scope.viewVoucher = function(id) {
        $scope.isLoading = true;
        $http.get(API_URL + "/" + id)
            .then(function(response) {
                const voucher = response.data;
                const modalBody = document.getElementById("viewVoucherBody");
                modalBody.innerHTML = `
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
                $('#viewVoucherModal').modal('show');
            })
            .catch(function(error) {
                console.error("Lỗi khi lấy thông tin chi tiết voucher:", error);
                toastr.error("Có lỗi khi lấy thông tin voucher!");
            })
            .finally(function() {
                $scope.isLoading = false;
            });
    };

    // Mở modal xác nhận xóa
    $scope.openDeleteConfirmModal = function(id) {
        currentVoucherId = id;
        $('#deleteConfirmModal').modal('show');
    };

    // Xóa voucher
    $scope.deleteVoucher = function() {
        $scope.isLoading = true;
        $http.delete(API_URL + "/delete/" + currentVoucherId)
            .then(function(response) {
                $('#deleteConfirmModal').modal('hide');
                $scope.loadData();
                toastr.success("Xóa voucher thành công!");
            })
            .catch(function(error) {
                console.error("Lỗi khi xóa voucher:", error);
                toastr.error("Có lỗi khi xóa voucher!");
            })
            .finally(function() {
                $scope.isLoading = false;
            });
    };

    // Các hàm hỗ trợ
    $scope.getVoucherTypeDisplay = function(type) {
        switch (type) {
            case "fixed": return "Cố định";
            case "freeship": return "Miễn phí vận chuyển";
            case "percentage": return "Phần trăm";
            default: return type;
        }
    };

    $scope.getDiscountValueDisplay = function(voucher) {
        if (voucher.voucherType === "fixed" || voucher.voucherType === "freeship") {
            return $scope.formatCurrency(voucher.discountValue);
        } else if (voucher.voucherType === "percentage") {
            return `${voucher.discountValue}%`;
        }
        return voucher.discountValue;
    };

    $scope.getStatusDisplay = function(status) {
        switch (status) {
            case 0: return "Không hoạt động";
            case 1: return "Hoạt động";
            case 2: return "Hết hạn";
            case 3: return "Chờ hoạt động";
            default: return "Không xác định";
        }
    };

    $scope.getStatusBadgeClass = function(status) {
        switch (status) {
            case 0: return "badge-secondary";
            case 1: return "badge-success";
            case 2: return "badge-danger";
            case 3: return "badge-warning";
            default: return "badge-warning";
        }
    };

    $scope.formatCurrency = function(amount) {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Khởi tạo
    $scope.loadData();
});