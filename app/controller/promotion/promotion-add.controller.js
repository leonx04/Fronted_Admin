app.controller('AddPromotionController', function($scope, $http, $timeout) {
    // Constants
    const API_URL = "http://localhost:8080/api/v1";
    const ADMIN_API = "http://localhost:8080/api/admin";

    // Scope variables initialization
    $scope.promotionData = {};
    $scope.validationErrors = [];
    $scope.isLoading = false;
    $scope.products = [];
    $scope.selectedProductDetails = [];

    // Configure toastr
    toastr.options = {
        "preventDuplicates": true,
        "closeButton": true,
        "progressBar": true,
        "timeOut": "3000"
    };

    // API Service functions
    const apiService = {
        getProducts: function() {
            return $http.get(`${API_URL}/admin/products`)
                .then(response => {
                    console.log('API Response:', response.data); // Debug log
                    return response.data.date; // Changed from data.data to data.date
                })
                .catch(error => {
                    console.error('Error fetching products:', error);
                    throw error;
                });
        },

        getProductDetails: function(productId) {
            return $http.get(`${API_URL}/admin/items?productId=${productId}`)
                .then(response => response.data.date) // Changed from data.data to data.date
                .catch(error => {
                    console.error('Error fetching product details:', error);
                    throw error;
                });
        },

        createPromotion: function(promotionData) {
            return $http.post(`${ADMIN_API}/promotions`, promotionData)
                .then(response => response.data)
                .catch(error => {
                    console.error('Error creating promotion:', error);
                    throw error;
                });
        }
    };

    // Controller functions
    $scope.fetchProducts = function() {
        $scope.isLoading = true;
        apiService.getProducts()
            .then(function(products) {
                console.log('Fetched products:', products); // Debug log
                $scope.products = products || [];
                if (!$scope.products.length) {
                    toastr.warning("Không có sản phẩm nào");
                }
            })
            .catch(() => toastr.error("Lỗi khi tải danh sách sản phẩm"))
            .finally(() => $scope.isLoading = false);
    };

    $scope.selectProduct = function(product) {
        if (!product || !product.id) {
            console.error('Invalid product:', product);
            return;
        }

        apiService.getProductDetails(product.id)
            .then(function(details) {
                console.log('Product details:', details); // Debug log
                $scope.selectedProductDetails = details.map(item => ({
                    ...item,
                    productName: product.name,
                    imageUrl: item.imageUrl || 'https://via.placeholder.com/50',
                    condition: item.condition || 'Mới'
                }));
            })
            .catch(() => toastr.error("Lỗi khi tải chi tiết sản phẩm"));
    };

    $scope.validatePromotion = function() {
        $scope.validationErrors = [];

        if (!$scope.promotionData.code?.trim()) {
            $scope.validationErrors.push('Mã khuyến mãi không được để trống');
        }

        if (!$scope.promotionData.name?.trim()) {
            $scope.validationErrors.push('Tên khuyến mãi không được để trống');
        }

        if (!$scope.promotionData.startDate) {
            $scope.validationErrors.push('Ngày bắt đầu không được để trống');
        }

        if (!$scope.promotionData.endDate) {
            $scope.validationErrors.push('Ngày kết thúc không được để trống');
        }

        if ($scope.promotionData.startDate && $scope.promotionData.endDate) {
            if (new Date($scope.promotionData.startDate) >= new Date($scope.promotionData.endDate)) {
                $scope.validationErrors.push('Ngày kết thúc phải sau ngày bắt đầu');
            }
        }

        const discountValue = parseFloat($scope.promotionData.discountPercentage);
        if (!discountValue || isNaN(discountValue) || discountValue <= 0 || discountValue > 90) {
            $scope.validationErrors.push('Giá trị giảm giá phải là số dương và không vượt quá 90%');
        }

        return $scope.validationErrors.length === 0;
    };

    function displayErrorsSequentially(index = 0) {
        if (index < $scope.validationErrors.length) {
            toastr.error($scope.validationErrors[index], '', {
                onHidden: function() {
                    $timeout(function() {
                        displayErrorsSequentially(index + 1);
                    }, 300);
                }
            });
        }
    }

    $scope.savePromotion = function() {
        if (!$scope.validatePromotion()) {
            displayErrorsSequentially();
            return;
        }

        $scope.isLoading = true;
        const promotionData = preparePromotionData();

        apiService.createPromotion(promotionData)
            .then(function() {
                toastr.success("Thêm khuyến mãi thành công!");
                resetForm();
            })
            .catch(() => toastr.error("Lỗi khi thêm khuyến mãi"))
            .finally(() => $scope.isLoading = false);
    };

    function preparePromotionData() {
        const data = { ...$scope.promotionData };
        if (data.startDate) {
            data.startDate = new Date(data.startDate).toISOString();
        }
        if (data.endDate) {
            data.endDate = new Date(data.endDate).toISOString();
        }
        return data;
    }

    function resetForm() {
        $scope.promotionData = {
            code: '',
            name: '',
            discountPercentage: '',
            startDate: null,
            endDate: null
        };
        $scope.selectedProductDetails = [];
    }

    // Initialize
    $scope.fetchProducts();

    // Debug function
    $scope.debug = function() {
        console.log('Current products:', $scope.products);
        console.log('Selected product details:', $scope.selectedProductDetails);
    };
});