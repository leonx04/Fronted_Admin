app.controller('CustomersListController', function($scope, $http, $interval, $timeout) {
    
    // Khai báo các biến và hằng số
    const API_URL = "http://localhost:8080/api/ecm/admin/customers";
    let updateInterval;

    // Khởi tạo các biến scope
    $scope.customers = [];
    $scope.searchParams = {};
    $scope.customerData = {};
    $scope.isEditing = false;
    $scope.isLoading = false;
    $scope.isSearching = false;


    // Biến phân trang
    $scope.currentPage = 0;
    $scope.pageSize = 3;
    $scope.totalItems = 0;
    $scope.totalPages = 0;

    
    // Biến id customer
    $scope.currentCustomerId = {
        "id" : ""
    };




    // Hàm tải danh sách khách hàng
    $scope.loadData = function(page) {
        $scope.isLoading = true;

        const params = {page: page};

        $http.get(API_URL, params)
            .then(function(response) {
                // $scope.isLoading = true;
                updateCustomerData(response.data);
                startAutoUpdate();
            })
            .catch(
                handleError("Lỗi khi tải danh sách khách hàng")
            )
            .finally(() => $scope.isLoading = false);
    };

    // Hàm cập nhật danh sách khách hàng
    function updateCustomerData(data) {
        $scope.customers = data.data[0];
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
        }, 10000);
    }

    // // Hàm đặt lại form tìm kiếm
    // $scope.resetForm = function () {
    //     $scope.searchParams = {};
    //     $scope.isSearching = false;
    //     $scope.loadData(0);
    // };

    // // Hàm thay đổi trang
    // $scope.changePage = function (page) {
    //     if ($scope.isSearching) {
    //         $scope.searchCustomers(page);
    //     } else {
    //         $scope.loadData(page);
    //     }
    // };
    


    // // Open add customer modal
    // $scope.openAddModal = function() {
    //     $scope.customerData = {};
    //     $scope.isEditing = false;
    //     $('#customerModal').modal('show');
    // };

    // // View customer details
    $scope.viewCustomer = function(id) {
        $http.get(API_URL + "/" + id)
            .then(function(response) {
                $scope.customerData = response.data;
                $scope.isEditing = false;
                $('#customerModal').modal('show');
            })
            .catch(function(error) {
                console.error("Lỗi khi lấy thông tin khách hàng:", error);
            });
    };

    // // Save customer
    // $scope.saveCustomer = function() {
    //     const method = $scope.customerData.id ? 'PUT' : 'POST';
    //     const url = $scope.customerData.id ? `${API_URL}/${$scope.customerData.id}` : API_URL;

    //     $http({
    //         method: method,
    //         url: url,
    //         data: $scope.customerData
    //     }).then(function(response) {
    //         $('#customerModal').modal('hide');
    //         $scope.loadData();
    //     }).catch(function(error) {
    //         console.error("Lỗi khi lưu khách hàng:", error);
    //     });
    // };

    

    // Mở modal updateStatus và lưu ID khách hàng
    $scope.openUpdateStatusModal = function (id) {
        $scope.isEditing = true;
        // Gọi API để lấy chi tiết khách hàng theo ID
        $http.get(API_URL + "/" + id)
            .then(function (response) {
                console.log("API response:", response.data);  // Xem kết quả trả về từ API
                if (response.data && response.data.id) {  // Kiểm tra dữ liệu trả về có hợp lệ không
                    $scope.customerData = response.data;  // Gán dữ liệu vào customerData
                    $('#updateStatusModal').modal('show');  // Hiển thị modal
                    $scope.currentCustomerId.id = id;  // Lưu ID khách hàng vào $scope.currentCustomerId
                    console.log("ID khách hàng khi mở modal: ", $scope.currentCustomerId.id);  // Kiểm tra ID
                } else {
                    console.error("Không tìm thấy thông tin khách hàng.");
                }
            })
            .catch(function (error) {
                console.error("Lỗi khi lấy trạng thái khách hàng:", error);
            });
    };

    
    
    // Hàm cập nhật trạng thái khách hàng
    $scope.updateStatus = function (status) {
        let id = $scope.currentCustomerId.id;  // Sử dụng ID đã lưu trong $scope.currentCustomerId từ modal
        console.log("ID khách hàng từ modal: ", id);  // Kiểm tra ID trước khi thực hiện cập nhật

        if (!id) {  // Nếu không có ID, báo lỗi
            console.error("ID khách hàng không hợp lệ.");
            return;
        }

        if (confirm("Xác nhận thay đổi trạng thái khách hàng?")) {
            const params = `?status=${status}`;  // Tạo query parameter với status mới
            $http.patch(API_URL + "/" + id + "/status" + params)
                .then(function (response) {
                    console.log("Cập nhật trạng thái khách hàng thành công:", response);
                    $('#updateStatusModal').modal('hide');  // Ẩn modal sau khi cập nhật thành công
                    $scope.loadData($scope.currentPage);  // Reload lại danh sách khách hàng
                })
                .catch(function (error) {
                    console.error("Lỗi khi cập nhật trạng thái khách hàng:", error);
                });
        }
    };

    

    // // Delete customer
    $scope.deleteCustomer = function(id) {
        if (confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
            $http.delete(API_URL + "/" + id)
                .then(function(response) {
                    console.log("Xóa khách hàng thành công:", response)
                    $scope.loadData(0);
                })
                .catch(function(error) {
                    console.error("Lỗi khi xóa khách hàng:", error);
                });
        }
    };

    // // Search customer
    // $scope.searchCustomer = function() {
    //     const params = Object.entries($scope.searchParams).map(([key, val]) => val ? `${key}=${val}` : '').filter(Boolean).join('&');
    //     $http.get(API_URL + (params ? `?${params}` : ''))
    //         .then(function(response) {
    //             $scope.customers = response.data.data[0];
    //         })
    //         .catch(function(error) {
    //             console.error("Lỗi khi tìm kiếm khách hàng:", error);
    //         });
    // };

    // // Hàm tìm kiếm voucher
    // $scope.searchCustomers = function (page) {
    //     $scope.isLoading = true;
    //     $scope.isSearching = true;
    //     if (updateInterval) {
    //         $interval.cancel(updateInterval);
    //     }
    //     let params = { ...$scope.searchParams, page: page, size: $scope.pageSize };
    //     $http.get(API_URL + "/search", { params: params })
    //         .then(function (response) {
    //             updateCustomerData(response.data);
    //         })
    //         .catch(handleError("Lỗi khi tìm kiếm voucher"))
    //         .finally(() => $scope.isLoading = false);
    // };    

    // // Cấu hình toastr
    toastr.options = {
        "preventDuplicates": true,
        "closeButton": true,
        "progressBar": true,
    };

    // // Hàm xử lý lỗi chung
    function handleError(errorMessage) {
        return function (error) {
            console.error(errorMessage + ":", error);
            toastr.error(errorMessage + "!");
        };
    }

    // Hàm khởi tạo
    function init() {
        $scope.loadData(0);
    }

    // // Khởi tạo controller
    init();

    // Hủy interval khi controller bị hủy
    $scope.$on('$destroy', function () {
        if (updateInterval) {
            $interval.cancel(updateInterval);
        }
    });

});