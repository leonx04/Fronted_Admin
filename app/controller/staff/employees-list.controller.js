app.controller('EmployeeController', function ($scope, EmployeeService) {
    
    $scope.employees = [];
    $scope.employeeData = {};
    $scope.isEditing = false;
    $scope.searchParams = {};

    // Get list of employees
    $scope.getEmployees = function () {
        EmployeeService.getAll().then(function (response) {
            $scope.employees = response.data;
        });
    };

    // Open Add Employee Modal
    $scope.openAddModal = function () {
        $scope.employeeData = {};
        $scope.isEditing = false;
        $('#employeeModal').modal('show');
    };

    // Open Edit Employee Modal
    $scope.editEmployee = function (id) {
        EmployeeService.getById(id).then(function (response) {
            $scope.employeeData = response.data;
            $scope.isEditing = true;
            $('#employeeModal').modal('show');
        });
    };

    // Save Employee (Add or Edit)
    $scope.saveEmployee = function () {
        if ($scope.isEditing) {
            EmployeeService.update($scope.employeeData).then(function (response) {
                $('#employeeModal').modal('hide');
                $scope.getEmployees();
            });
        } else {
            EmployeeService.create($scope.employeeData).then(function (response) {
                $('#employeeModal').modal('hide');
                $scope.getEmployees();
            });
        }
    };

    // Delete Employee
    $scope.openDeleteModal = function (id) {
        if (confirm('Bạn có chắc chắn muốn xóa?')) {
            EmployeeService.delete(id).then(function (response) {
                $scope.getEmployees();
            });
        }
    };

    // Search Employees
    $scope.searchEmployees = function () {
        EmployeeService.search($scope.searchParams).then(function (response) {
            $scope.employees = response.data;
        });
    };

    // Reset Search Form
    $scope.resetForm = function () {
        $scope.searchParams = {};
        $scope.getEmployees();
    };

    $scope.getEmployees();
});

app.service('EmployeeService', function ($http) {
    this.getAll = function () {
        return $http.get('/api/admin/employees');
    };

    this.getById = function (id) {
        return $http.get('/api/admin/employees/' + id);
    };

    this.create = function (employee) {
        return $http.post('/api/admin/employees', employee);
    };

    this.update = function (employee) {
        return $http.put('/api/admin/employees/' + employee.id, employee);
    };

    this.delete = function (id) {
        return $http.delete('/api/admin/employees/' + id);
    };

    this.search = function (params) {
        return $http.post('/api/admin/employees/search', params);
    };
});
