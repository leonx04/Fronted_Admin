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

    // lấy lỗi
    $scope.validationErrors = [];

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
        // $scope.totalItems = data.totalPage;
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

    // Hàm validate customer
    $scope.validateCustomer = function () {
        $scope.validationErrors = []; // Reset lỗi

        if (!$scope.customerData.fullName || $scope.customerData.fullName.trim() === '') {
            $scope.validationErrors.push('Tên Khách hàng không được để trống');
        }

        // kiểm tra sdt trống, độ dài >= 10, là số
        if (!$scope.customerData.phone || $scope.customerData.phone.trim() === '') {
            $scope.validationErrors.push('Số điện thoại không được để trống');
        } else {
            let phone = $scope.customerData.phone;
            if (isNaN(phone) || phone.length < 10) {
                $scope.validationErrors.push('Số điện thoại không hợp lệ');
            }
        }

        // kiểm tra email trống, đúng định dạng
        if (!$scope.customerData.email || $scope.customerData.email.trim() === '') {
            $scope.validationErrors.push('Email không được để trống');
        } else {
            let email = $scope.customerData.email;
            if (!email.includes('@') || !email.includes('.')) {
                $scope.validationErrors.push('Email không hợp lệ');
            }
        }

        // if (!$scope.customerData.endDate) {
        //     $scope.validationErrors.push('Ngày kết thúc không được để trống');
        // }

        // if ($scope.customerData.startDate && $scope.customerData.endDate) {
        //     if ($scope.customerData.startDate >= $scope.customerData.endDate) {
        //         $scope.validationErrors.push('Ngày kết thúc phải sau ngày bắt đầu');
        //     }
        // }

        // if ($scope.customerData.discountPercentage === undefined || $scope.customerData.discountPercentage === null) {
        //     $scope.validationErrors.push('Giá trị giảm giá không được để trống');
        // } else {
        //     let discountValue = parseFloat($scope.customerData.discountPercentage);
        //     if (isNaN(discountValue) || discountValue <= 0 || discountValue > 90) {
        //         $scope.validationErrors.push('Giá trị giảm giá phải là số dương và không vượt quá 90%');
        //     }
        // }

        return $scope.validationErrors.length === 0;
    };

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
        console.log("trạng thái tìm kiếm ", $scope.isSearching, page);
        if (!$scope.isSearching) {
            console.log("load");
            $scope.loadData(page); // Nếu không, gọi lại loadData để lấy dữ liệu cho trang mới
        } else {
            console.log("search");
            $scope.searchCustomer(page); // Nếu đang tìm kiếm, gọi lại hàm tìm kiếm
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

    // Hàm lưu khách hàng
    $scope.saveCustomer = function () {
        if ($scope.customerData.birthDate) {
            // Đảm bảo chuyển đổi sang định dạng yyyy-MM-dd
            $scope.customerData.birthDate = new Date($scope.customerData.birthDate);
        }
        
        const method = $scope.customerData.id ? 'PUT' : 'POST';
        const url = $scope.customerData.id ? `${API_URL}/${$scope.customerData.id}` : API_URL;
        
        $http({
            method: method,
            url: url,
            data: $scope.customerData
        }).then(function (response) {
            $scope.loadData(0);
            $('#customerModal').modal('hide');
        }).catch(function (error) {
            console.error("Lỗi khi lưu khách hàng:", error);
        });
    };
    

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
        // if ($scope.currentPage)
        console.log("trang : ", page)

        const params = {
            name: $scope.searchParams.name || null,
            email: $scope.searchParams.email || null,
            phone: $scope.searchParams.phone || null,
            gender: $scope.searchParams.gender || null,
            status: $scope.searchParams.status || null,
            page: 4
        };

        if (!params.name && !params.email && !params.phone && !params.gender && !params.status) {
            // toastr.warning("Vui lòng nhập ít nhất một trường để tìm kiếm.");
            $scope.loadData(0)
        } else {
            console.log(params)

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
            // .finally(function () {
            //     $scope.isLoading = true;
            //     $scope.isSearching = true; // Kết thúc trạng thái tìm kiếm
            //     // Tùy chọn: có thể gọi lại startAutoUpdate() nếu muốn tiếp tục auto-update sau khi tìm kiếm
            // });
        }

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