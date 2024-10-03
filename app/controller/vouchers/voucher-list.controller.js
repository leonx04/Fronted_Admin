app.controller('VouchersController', function ($scope, $http) {
    const API_URL = "http://localhost:8080/api/admin/vouchers";
    $scope.vouchers = [];
    $scope.searchParams = {};
    $scope.voucherData = {};
    $scope.isEditing = false;
    let currentVoucherId = null;

    // Load initial data
    $scope.loadData = function() {
        $http.get(API_URL)
            .then(function(response) {
                $scope.vouchers = response.data;
            })
            .catch(function(error) {
                console.error("Error fetching vouchers:", error);
                toastr.error("Có lỗi khi lấy danh sách voucher!");
            });
    };

    // Search vouchers
    $scope.searchVouchers = function() {
        $http.get(API_URL + "/search", { params: $scope.searchParams })
            .then(function(response) {
                $scope.vouchers = response.data;
            })
            .catch(function(error) {
                console.error("Error searching vouchers:", error);
                toastr.error("Có lỗi khi tìm kiếm voucher!");
            });
    };

    // Reset search form
    $scope.resetForm = function() {
        $scope.searchParams = {};
        $scope.loadData();
    };

    // Open add modal
    $scope.openAddModal = function() {
        $scope.isEditing = false;
        $scope.voucherData = {};
        $('#voucherModal').modal('show');
    };

    // Edit voucher
    $scope.editVoucher = function(id) {
        $scope.isEditing = true;
        $http.get(API_URL + "/" + id)
            .then(function(response) {
                $scope.voucherData = response.data;
                $scope.voucherData.startDate = new Date($scope.voucherData.startDate);
                $scope.voucherData.endDate = new Date($scope.voucherData.endDate);
                currentVoucherId = id;
                $('#voucherModal').modal('show');
            })
            .catch(function(error) {
                console.error("Error fetching voucher details:", error);
                toastr.error("Có lỗi khi lấy thông tin voucher!");
            });
    };

    // Save voucher (add or update)
    $scope.saveVoucher = function() {
        let url = API_URL;
        let method = 'POST';
        if ($scope.isEditing) {
            url += "/update/" + currentVoucherId;
            method = 'PUT';
        }

        $http({
            method: method,
            url: url,
            data: $scope.voucherData
        }).then(function(response) {
            $('#voucherModal').modal('hide');
            $scope.loadData();
            toastr.success("Lưu voucher thành công!");
        }).catch(function(error) {
            console.error("Error saving voucher:", error);
            toastr.error("Có lỗi khi lưu voucher!");
        });
    };

    // View voucher details
    $scope.viewVoucher = function(id) {
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
                console.error("Error fetching voucher details:", error);
                toastr.error("Có lỗi khi lấy thông tin voucher!");
            });
    };

    // Open delete confirm modal
    $scope.openDeleteConfirmModal = function(id) {
        currentVoucherId = id;
        $('#deleteConfirmModal').modal('show');
    };

    // Delete voucher
    $scope.deleteVoucher = function() {
        $http.delete(API_URL + "/delete/" + currentVoucherId)
            .then(function(response) {
                $('#deleteConfirmModal').modal('hide');
                $scope.loadData();
                toastr.success("Xóa voucher thành công!");
            })
            .catch(function(error) {
                console.error("Error deleting voucher:", error);
                toastr.error("Có lỗi khi xóa voucher!");
            });
    };

    // Helper functions
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
            default: return "Không xác định";
        }
    };

    $scope.getStatusBadgeClass = function(status) {
        switch (status) {
            case 0: return "badge-secondary";
            case 1: return "badge-success";
            case 2: return "badge-danger";
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

    // Initialize
    $scope.loadData();
});