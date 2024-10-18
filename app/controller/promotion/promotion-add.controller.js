// promotion-add.controller.js
app.controller('AddPromotionController', function($scope, $http, $timeout) {
    // Constants
    const API_URL = "http://localhost:8080/api/v1";
    const ADMIN_API = "http://localhost:8080/api/admin";

    // Scope variables initialization
    $scope.promotionData = {
        code: '',
        name: '',
        discountPercentage: '',
        startDate: null,
        endDate: null
    };
    $scope.validationErrors = [];
    $scope.isLoading = false;
    $scope.products = [];
    $scope.selectedProductDetails = [];
    $scope.checkedProductDetails = [];
    $scope.selectAll = false;

    // Configure toastr
    toastr.options = {
        "preventDuplicates": true,
        "closeButton": true,
        "progressBar": true,
        "timeOut": "3000",
        "positionClass": "toast-top-right"
    };

    // API Service functions
    const apiService = {
        getProducts: function() {
            return $http.get(`${API_URL}/admin/products`)
                .then(response => response.data.date)
                .catch(error => {
                    console.error('Error fetching products:', error);
                    throw error;
                });
        },

        getProductDetails: function(productId) {
            return $http.get(`${API_URL}/admin/items?productId=${productId}`)
                .then(response => response.data.date)
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
        },

        applyPromotionToProducts: function(promotionId, productDetailIds) {
            return $http.post(`${API_URL}/promotion-products/apply`, 
                productDetailIds,
                { params: { promotionId: promotionId } }
            )
            .then(response => response.data)
            .catch(error => {
                console.error('Error applying promotion:', error);
                throw error;
            });
        }
    };

    // Checkbox handling functions
    $scope.toggleAllSelection = function() {
        const eligibleProducts = $scope.selectedProductDetails.filter(
            detail => detail.status === 1 && !detail.promotion
        );
        
        // Update all eligible products based on selectAll state
        eligibleProducts.forEach(detail => {
            detail.selected = $scope.selectAll;
            updateCheckedList(detail);
        });
    };

    $scope.toggleSelection = function(detail) {
        if (detail.status === 1 && !detail.promotion) {
            updateCheckedList(detail);
            updateSelectAllState();
        }
    };

    function updateCheckedList(detail) {
        const index = $scope.checkedProductDetails.findIndex(d => d.id === detail.id);
        if (detail.selected && index === -1) {
            $scope.checkedProductDetails.push(detail);
        } else if (!detail.selected && index !== -1) {
            $scope.checkedProductDetails.splice(index, 1);
        }
    }

    function updateSelectAllState() {
        const eligibleProducts = $scope.selectedProductDetails.filter(
            detail => detail.status === 1 && !detail.promotion
        );
        $scope.selectAll = eligibleProducts.length > 0 && 
                          eligibleProducts.every(detail => detail.selected);
    }

    // Form handling functions
    $scope.fetchProducts = function() {
        $scope.isLoading = true;
        apiService.getProducts()
            .then(function(products) {
                $scope.products = products || [];
                if (!$scope.products.length) {
                    toastr.warning("Không có sản phẩm nào");
                }
            })
            .catch(function() {
                toastr.error("Lỗi khi tải danh sách sản phẩm");
            })
            .finally(function() {
                $scope.isLoading = false;
            });
    };

    $scope.selectProduct = function(product) {
        if (!product || !product.id) {
            console.error('Invalid product:', product);
            return;
        }

        apiService.getProductDetails(product.id)
            .then(function(details) {
                $scope.selectedProductDetails = details.map(item => ({
                    ...item,
                    productName: product.name,
                    imageUrl: item.imageUrl || 'https://via.placeholder.com/50',
                    condition: item.condition || 'Mới',
                    selected: false
                }));
                // Reset selection states
                $scope.selectAll = false;
                $scope.checkedProductDetails = [];
            })
            .catch(function() {
                toastr.error("Lỗi khi tải chi tiết sản phẩm");
            });
    };

    $scope.validatePromotion = function() {
        $scope.validationErrors = [];

        const validations = [
            {
                condition: !$scope.promotionData.code?.trim(),
                message: 'Mã khuyến mãi không được để trống'
            },
            {
                condition: !$scope.promotionData.name?.trim(),
                message: 'Tên khuyến mãi không được để trống'
            },
            {
                condition: !$scope.promotionData.startDate,
                message: 'Ngày bắt đầu không được để trống'
            },
            {
                condition: !$scope.promotionData.endDate,
                message: 'Ngày kết thúc không được để trống'
            },
            {
                condition: $scope.promotionData.startDate && 
                          $scope.promotionData.endDate && 
                          new Date($scope.promotionData.startDate) >= new Date($scope.promotionData.endDate),
                message: 'Ngày kết thúc phải sau ngày bắt đầu'
            },
            {
                condition: !$scope.promotionData.discountPercentage || 
                          isNaN(parseFloat($scope.promotionData.discountPercentage)) || 
                          parseFloat($scope.promotionData.discountPercentage) <= 0 || 
                          parseFloat($scope.promotionData.discountPercentage) > 90,
                message: 'Giá trị giảm giá phải là số dương và không vượt quá 90%'
            },
            {
                condition: $scope.checkedProductDetails.length === 0,
                message: 'Vui lòng chọn ít nhất một sản phẩm để áp dụng khuyến mãi'
            }
        ];

        validations.forEach(validation => {
            if (validation.condition) {
                $scope.validationErrors.push(validation.message);
            }
        });

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
        // Reset form data
        $scope.promotionData = {
            code: '',
            name: '',
            discountPercentage: '',
            startDate: null,
            endDate: null
        };
        
        // Reset selection states
        $scope.selectedProductDetails = $scope.selectedProductDetails.map(detail => ({
            ...detail,
            selected: false
        }));
        $scope.checkedProductDetails = [];
        $scope.selectAll = false;
        
        // Reset validation
        $scope.validationErrors = [];
    }

    $scope.savePromotion = function() {
        if (!$scope.validatePromotion()) {
            displayErrorsSequentially();
            return;
        }

        $scope.isLoading = true;
        const promotionData = preparePromotionData();

        apiService.createPromotion(promotionData)
            .then(function(createdPromotion) {
                const selectedIds = $scope.checkedProductDetails.map(detail => detail.id);
                return apiService.applyPromotionToProducts(createdPromotion.id, selectedIds)
                    .then(function() {
                        toastr.success("Thêm và áp dụng khuyến mãi thành công!");
                        resetForm();
                        // Refresh product details to show updated promotion status
                        if ($scope.selectedProductDetails.length > 0) {
                            const currentProductId = $scope.selectedProductDetails[0].productId;
                            $scope.selectProduct({ id: currentProductId });
                        }
                    });
            })
            .catch(function(error) {
                console.error('Error in save process:', error);
                toastr.error("Lỗi khi thêm khuyến mãi");
            })
            .finally(function() {
                $scope.isLoading = false;
            });
    };

    // Initialize
    $scope.fetchProducts();
});