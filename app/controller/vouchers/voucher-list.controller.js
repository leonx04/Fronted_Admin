// Controller quản lý voucher
app.controller('VouchersController', function ($scope, $http, $interval) {
    // URL API để tương tác với backend
    const API_URL = "http://localhost:8080/api/admin/vouchers";

    // Khởi tạo các biến và đối tượng trong scope
    $scope.vouchers = [];          // Mảng chứa danh sách voucher
    $scope.searchParams = {};      // Đối tượng chứa các tham số tìm kiếm
    $scope.voucherData = {};       // Đối tượng chứa dữ liệu của voucher đang được thêm/sửa
    $scope.isEditing = false;      // Biến đánh dấu trạng thái đang chỉnh sửa hay thêm mới
    $scope.isLoading = false;      // Biến đánh dấu trạng thái đang tải dữ liệu
    $scope.isSearching = false;    // Biến đánh dấu trạng thái đang tìm kiếm

    let currentVoucherId = null;   // Biến lưu ID của voucher đang được chỉnh sửa
    let updateInterval;            // Biến lưu interval để cập nhật dữ liệu tự động

    // Hàm tải dữ liệu ban đầu
    $scope.loadData = function () {
        $scope.isLoading = true;
        $http.get(API_URL)
            .then(function (response) {
                $scope.vouchers = response.data;
                startAutoUpdate(); // Bắt đầu cập nhật tự động sau khi tải dữ liệu
            })
            .catch(function (error) {
                console.error("Lỗi khi tải danh sách voucher:", error);
                toastr.error("Có lỗi khi lấy danh sách voucher!");
            })
            .finally(function () {
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
        updateInterval = $interval(function () {
            // Chỉ cập nhật khi không đang tải dữ liệu và không đang tìm kiếm
            if (!$scope.isLoading && !$scope.isSearching) {
                $http.get(API_URL)
                    .then(function (response) {
                        $scope.vouchers = response.data;
                    })
                    .catch(function (error) {
                        console.error("Lỗi khi cập nhật danh sách voucher:", error);
                    });
            }
        }, 1000);
    }

    // Hàm tìm kiếm voucher
    $scope.searchVouchers = function () {
        $scope.isLoading = true;
        $scope.isSearching = true;
        // Hủy cập nhật tự động khi đang tìm kiếm
        if (updateInterval) {
            $interval.cancel(updateInterval);
        }
        $http.get(API_URL + "/search", { params: $scope.searchParams })
            .then(function (response) {
                $scope.vouchers = response.data;
            })
            .catch(function (error) {
                console.error("Lỗi khi tìm kiếm voucher:", error);
                toastr.error("Có lỗi khi tìm kiếm voucher!");
            })
            .finally(function () {
                $scope.isLoading = false;
            });
    };

    // Hàm đặt lại biểu mẫu tìm kiếm
    $scope.resetForm = function () {
        $scope.searchParams = {};
        $scope.isSearching = false;
        $scope.loadData(); // Tải lại dữ liệu và bắt đầu cập nhật tự động
    };

    // Hàm mở modal thêm mới voucher
    $scope.openAddModal = function () {
        $scope.isEditing = false;
        $scope.voucherData = {};
        $('#voucherModal').modal('show');
    };

    // Hàm chỉnh sửa voucher
    $scope.editVoucher = function (id) {
        $scope.isEditing = true;
        $scope.isLoading = true;
        $http.get(API_URL + "/" + id)
            .then(function (response) {
                $scope.voucherData = response.data;
                // Chuyển đổi chuỗi ngày thành đối tượng Date
                $scope.voucherData.startDate = new Date($scope.voucherData.startDate);
                $scope.voucherData.endDate = new Date($scope.voucherData.endDate);
                currentVoucherId = id;
                $('#voucherModal').modal('show');
            })
            .catch(function (error) {
                console.error("Lỗi khi lấy thông tin voucher:", error);
                toastr.error("Có lỗi khi lấy thông tin voucher!");
            })
            .finally(function () {
                $scope.isLoading = false;
            });
    };

    // Hàm lưu voucher (thêm mới hoặc cập nhật)
    $scope.saveVoucher = function () {
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
        // Chuyển đổi ngày giờ sang UTC trước khi gửi
        if (dataToSend.startDate) {
            dataToSend.startDate = new Date(dataToSend.startDate).toISOString();
        }
        if (dataToSend.endDate) {
            dataToSend.endDate = new Date(dataToSend.endDate).toISOString();
        }
        // In ra giá trị startDate và endDate để debug trước khi lưu
        console.log("Ngày bắt đầu (save):", $scope.voucherData.startDate);
        console.log("Ngày kết thúc (save):", $scope.voucherData.endDate);
        $http({
            method: method,
            url: url,
            data: dataToSend
        }).then(function (response) {
            $('#voucherModal').modal('hide');
            $scope.loadData();
            toastr.success("Lưu voucher thành công!");
        }).catch(function (error) {
            console.error("Lỗi khi lưu voucher:", error);
            toastr.error("Có lỗi khi lưu voucher!");
        }).finally(function () {
            $scope.isLoading = false;
        });
    };

    // Hàm xem chi tiết voucher
    $scope.viewVoucher = function (id) {
        $scope.isLoading = true;
        $http.get(API_URL + "/" + id)
            .then(function (response) {
                const voucher = response.data;
                const modalBody = document.getElementById("viewVoucherBody");
                // Tạo nội dung HTML cho modal chi tiết
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
            .catch(function (error) {
                console.error("Lỗi khi lấy thông tin chi tiết voucher:", error);
                toastr.error("Có lỗi khi lấy thông tin voucher!");
            })
            .finally(function () {
                $scope.isLoading = false;
            });
    };

    // Hàm mở modal xác nhận xóa
    $scope.openDeleteConfirmModal = function (id) {
        currentVoucherId = id;
        $('#deleteConfirmModal').modal('show');
    };

    // Hàm xóa voucher
    $scope.deleteVoucher = function () {
        $scope.isLoading = true;
        $http.delete(API_URL + "/delete/" + currentVoucherId)
            .then(function (response) {
                $('#deleteConfirmModal').modal('hide');
                $scope.loadData();
                toastr.success("Xóa voucher thành công!");
            })
            .catch(function (error) {
                console.error("Lỗi khi xóa voucher:", error);
                toastr.error("Có lỗi khi xóa voucher!");
            })
            .finally(function () {
                $scope.isLoading = false;
            });
    };

    // Hàm hỗ trợ: Hiển thị loại voucher
    $scope.getVoucherTypeDisplay = function (type) {
        switch (type) {
            case "fixed": return "Cố định";
            case "freeship": return "Miễn phí vận chuyển";
            case "percentage": return "Phần trăm";
            default: return type;
        }
    };

    // Hàm hỗ trợ: Hiển thị giá trị giảm giá
    $scope.getDiscountValueDisplay = function (voucher) {
        if (voucher.voucherType === "fixed" || voucher.voucherType === "freeship") {
            return $scope.formatCurrency(voucher.discountValue);
        } else if (voucher.voucherType === "percentage") {
            return `${voucher.discountValue}%`;
        }
        return voucher.discountValue;
    };

    // Hàm hỗ trợ: Hiển thị trạng thái voucher
    $scope.getStatusDisplay = function (status) {
        switch (status) {
            case 0: return "Đã hết";
            case 1: return "Hoạt động";
            case 2: return "Không hoạt động";
            case 3: return "Chờ hoạt động";
            case 4: return "Đã kết thúc"
            default: return "Không xác định";
        }
    };

    // Hàm hỗ trợ: Lấy class cho badge trạng thái
    $scope.getStatusBadgeClass = function (status) {
        switch (status) {
            case 0: return "badge-secondary";
            case 1: return "badge-success";
            case 2: return "badge-info";
            case 3: return "badge-warning";
            case 4: return "badge-danger"
            default: return "badge-warning";
        }
    };

    // Hàm hỗ trợ: Định dạng tiền tệ
    $scope.formatCurrency = function (amount) {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Khởi tạo: Tải dữ liệu ban đầu
    $scope.loadData();

    // Hủy interval khi controller bị hủy
    $scope.$on('$destroy', function () {
        if (updateInterval) {
            $interval.cancel(updateInterval);
        }
    });
});