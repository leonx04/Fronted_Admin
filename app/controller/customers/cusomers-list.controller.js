app.controller('CustomersListController', function ($scope, $http, $interval, $timeout) {

    // Khai báo các biến và hằng số
    const API_URL = "http://localhost:8080/api/ecm/admin/customers";
    let updateInterval;

    // Khởi tạo các biến scope
    $scope.customers = [];
    $scope.searchParams = {};
    $scope.customerData = {
        // birthDate: "",
        // code: "",
        // email: "",
        // fullName: "",
        // gender: 1,
        // id: "",
        // imageURL: "",
        // password: "",
        // phone: "",
        // status: 1,
        // userName: "",
    };
    $scope.isEditing = false;
    $scope.isLoading = false;
    $scope.isSearching = false;

    // Biến phân trang
    $scope.currentPage = 0;
    $scope.pageSize = 3;
    $scope.totalItems = 0;
    $scope.totalPages = 0;


    // Biến id customer
    $scope.currentCustomerId = null;

    // Số lượng data
    $scope.quantityData = true;
    // Page
    $scope.page = 0;
    $scope.listPage =

        // Hàm tải danh sách khách hàng
        $scope.loadData = function (page) {
            $scope.isLoading = true;
            const params = { page: page };

            $http.get(API_URL, { params: params })
                .then(function (response) {
                    if (response.data && response.data.data && response.data.data.length > 0) {
                        $scope.page = page;
                        updateCustomerData(response.data)
                    } else {
                        $scope.customers = [];
                        $scope.totalItems = 0;
                        $scope.totalPages = 0;
                    }
                    startAutoUpdate();
                })
                .catch(handleError("Lỗi khi tải danh sách khách hàng"))
                .finally(() => $scope.isLoading = false);
        };


    // Hàm cập nhật danh sách khách hàng
    function updateCustomerData(data) {
        $scope.customers = data.data[0];
        $scope.currentPage = $scope.page;
        $scope.totalItems = data.totalPage;
        $scope.totalPages = data.totalPage;
    }

    // Hàm bắt đầu tự động cập nhật
    function startAutoUpdate() {
        if (updateInterval) {
            $interval.cancel(updateInterval);
        }
        updateInterval = $interval(function () {
            if (!$scope.isLoading && !$scope.isSearching) {
                console.log("sc" + $scope.isSearching, "ld" + $scope.isLoading);
                $scope.loadData($scope.currentPage);
            }
        }, 50000);
    }

    // Hàm dừng tự động cập nhật
    function stopAutoUpdate() {
        if (updateInterval) {
            $interval.cancel(updateInterval);
        }
    }

    // Hàm đặt lại form tìm kiếm
    $scope.resetForm = function () {
        $scope.searchParams = {};
        $scope.isSearching = false;
        $scope.loadData(0);
    };

    // Hàm tạo mảng số trang để hiển thị
    $scope.getPageRange = function () {
        let start = Math.max(1, $scope.currentPage - 1);
        let end = Math.min($scope.totalPages - 2, $scope.currentPage + 1);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    // Hàm thay đổi trang
    $scope.changePage = function (page) {
        if (page < 0 || page >= $scope.totalPage) {
            return; // Không cho phép chuyển sang trang không hợp lệ
        }
        $scope.currentPage = page; // Cập nhật trang hiện tại
        if ($scope.isSearching) {
            $scope.searchCustomer(); // Nếu đang tìm kiếm, gọi lại hàm tìm kiếm
        } else {
            $scope.loadData(page); // Nếu không, gọi lại loadData để lấy dữ liệu cho trang mới
        }
    };




    // Open add customer modal
    $scope.openAddModal = function () {
        $scope.customerData = {};
        $scope.isEditing = true;
        $('#customerModal').modal('show');
    };

    // // View customer details
    $scope.viewCustomer = function (id) {
        console.log(id);
        $http.get(API_URL + "/" + id)
            .then(function (response) {
                $scope.customerData = response.data;
                $scope.customerData.birthDate = new Date(response.data.birthDate);
                $scope.customerData.gender = String(response.data.gender);

                $scope.isEditing = true;
                console.log($scope.customerData)
                $('#customerModal').modal('show');
            })
            .catch(function (error) {
                console.error("Lỗi khi lấy thông tin khách hàng:", error);
            });
    };

    // Hàm thêm khách hàng
    $scope.saveCustomer = function () {
        // // nếu có id thì là update còn không thì là add
        // const method = $scope.customerData.id ? 'PUT' : 'POST';
        // const url = $scope.customerData.id ? `${API_URL}/${$scope.customerData.id}` : API_URL;
        // console.log(url, $scope.customerData);
        // $http({
        //     method: method,
        //     url: url,
        //     data: $scope.customerData
        // }).then(function (response) {
        //     $scope.loadData(0);
        //     $('#customerModal').modal('hide');
        // }).catch(function (error) {
        //     console.error("Lỗi khi lưu khách hàng:", error);
        // });

        const formData = new FormData();
        for (let key in $scope.customerData) {
            formData.append(key, $scope.customerData[key]);
        }
        if ($scope.customerData.avatar) {
            formData.append('avatar', $scope.customerData.avatar);
        }

        const method = $scope.customerData.id ? 'PUT' : 'POST';
        const url = $scope.customerData.id ? `${API_URL}/${$scope.customerData.id}` : API_URL;

        $http({
            method: method,
            url: url,
            data: formData,
            headers: { 'Content-Type': undefined } // để Angular tự đặt đúng boundary
        }).then(function (response) {
            $scope.loadData(0);
            $('#customerModal').modal('hide');
        }).catch(function (error) {
            console.error("Lỗi khi lưu khách hàng:", error);
        });

    }

    // Mở modal updateStatus và lưu ID khách hàng
    $scope.openUpdateStatusModal = function (id) {
        $scope.isEditing = true;
        // Gọi API để lấy chi tiết khách hàng theo ID
        $http.get(API_URL + "/" + id)
            .then(function (response) {
                console.log("API response:", response.data);  // Xem kết quả trả về từ API
                if (response.data && response.data.id) {  // Kiểm tra dữ liệu trả về có hợp lệ không
                    $scope.customerData = response.data;  // Gán dữ liệu vào customerData
                    console.log("Dữ liệu khách hàng: ", $scope.customerData);  // Kiểm tra dữ liệu trước khi mở modal
                    $scope.customerData.birthDate = new Date(response.data.birthDate);
                    $scope.customerData.status = String($scope.customerData.status);
                    console.log("Status khách hàng khi mở modal: ", $scope.customerData.status);  // Kiểm tra status
                    $scope.currentCustomerId = id;  // Lưu ID khách hàng vào $scope.currentCustomerId
                    console.log("ID khách hàng khi mở modal: ", $scope.currentCustomerId);  // Kiểm tra ID
                    $('#updateStatusModal').modal('show');  // Hiển thị modal
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
        let id = $scope.currentCustomerId;  // Sử dụng ID đã lưu trong $scope.currentCustomerId từ modal
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



    // Delete customer
    $scope.deleteCustomer = function (id) {
        if (!id || typeof id !== "number") {
            console.error("ID không hợp lệ:", id);
            toastr.error("Không thể xóa vì ID không hợp lệ.");
            return;
        }

        if (confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
            $http.delete(API_URL + "/" + id)
                .then(function (response) {
                    console.log("Xóa khách hàng thành công:", response);
                    toastr.success("Xóa khách hàng thành công.");
                    $scope.loadData(0);  // Chỉ tải lại danh sách khi thao tác thành công
                })
                .catch(function (error) {
                    console.error("Lỗi khi xóa khách hàng:", error);

                    // Xử lý lỗi chi tiết hơn dựa trên mã trạng thái HTTP
                    if (error.status === 400) {
                        toastr.error("Dữ liệu yêu cầu không hợp lệ.");
                    } else if (error.status === 404) {
                        toastr.error("Khách hàng không tồn tại hoặc đã bị xóa.");
                    } else if (error.status === 403) {
                        toastr.error("Bạn không có quyền xóa khách hàng này.");
                    } else {
                        toastr.error("Lỗi không xác định khi xóa khách hàng. Vui lòng thử lại sau.");
                    }
                });

        }
    };


    // Search customer
    $scope.searchCustomer = function (page) {

        const params = {
            name: $scope.searchParams.name || null,
            email: $scope.searchParams.email || null,
            phone: $scope.searchParams.phone || null,
            gender: $scope.searchParams.gender || null,
            status: $scope.searchParams.status || null,
            page: page
        };

        $scope.isLoading = true;
        $scope.isSearching = true; // Đặt trạng thái đang tìm kiếm

        $http.get(API_URL + "/search", { params: params })
            .then(function (response) {
                if (response.data && response.data.data && response.data.data.length > 0) {
                    updateCustomerData(response.data);
                } else {
                    $scope.customers = []; // Đặt danh sách khách hàng thành rỗng
                    toastr.warning("Không tìm thấy khách hàng nào.");
                }
            })
            .catch(function (error) {
                console.error("Lỗi khi tìm kiếm khách hàng:", error);
                toastr.error("Lỗi khi tìm kiếm khách hàng.");
            })
            .finally(function () {
                $scope.isLoading = false;
                $scope.isSearching = false; // Kết thúc trạng thái tìm kiếm
                // Tùy chọn: có thể gọi lại startAutoUpdate() nếu muốn tiếp tục auto-update sau khi tìm kiếm
            });
    };


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