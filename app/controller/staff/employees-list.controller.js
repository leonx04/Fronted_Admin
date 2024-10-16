
app.controller('EmployeesController', ['$scope', '$http', function($scope, $http) {
    const API_URL = "http://localhost:8080/api/admin/employees"; // Đường dẫn API

    $scope.employees = []; // Danh sách nhân viên
    $scope.employeeData = {}; // Dữ liệu nhân viên
    $scope.searchQuery = ''; // Truy vấn tìm kiếm

    // Hàm tải dữ liệu nhân viên
    $scope.loadData = function() {
        $http.get(API_URL)
            .then(function(response) {
                $scope.employees = response.data;
            })
            .catch(function(error) {
                console.error("Lỗi khi tải danh sách nhân viên:", error);
            });
    };

    // Hàm mở modal thêm nhân viên
    $scope.openAddModal = function() {
        $scope.employeeData = {}; // Reset dữ liệu
        $('#employeeModal').modal('show');
    };

    // Hàm xem chi tiết nhân viên
    $scope.viewEmployee = function(id) {
        $http.get(API_URL + "/" + id)
            .then(function(response) {
                $scope.employeeData = response.data;
                $('#employeeModal').modal('show');
            })
            .catch(function(error) {
                console.error("Lỗi khi lấy thông tin nhân viên:", error);
            });
    };

    // Hàm chỉnh sửa nhân viên
    $scope.editEmployee = function(id) {
        $http.get(API_URL + "/" + id)
            .then(function(response) {
                $scope.employeeData = response.data;
                $('#employeeModal').modal('show');
            })
            .catch(function(error) {
                console.error("Lỗi khi lấy thông tin nhân viên:", error);
            });
    };

    // Hàm lưu nhân viên
    $scope.saveEmployee = function() {
        const method = $scope.employeeData.id ? 'PUT' : 'POST';
        const url = $scope.employeeData.id ? `${API_URL}/${$scope.employeeData.id}` : API_URL;

        $http({
            method: method,
            url: url,
            data: $scope.employeeData
        }).then(function(response) {
            $('#employeeModal').modal('hide');
            $scope.loadData();
        }).catch(function(error) {
            console.error("Lỗi khi lưu nhân viên:", error);
        });
    };

    // Hàm lấy tên chức vụ
    $scope.getRoleName = function(roleid) {
        const roles = {
            1: 'Quản Lý',
            2: 'Nhân Viên',
        };
        return roles[roleid] || 'Không xác định';
    };

    // Khởi tạo dữ liệu khi controller được khởi động
    $scope.loadData();
}]);