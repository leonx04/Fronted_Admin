// Định nghĩa các hằng số API
const API_CONSTANTS = {
    BASE_URL: 'http://localhost:8080',
    get API_URL() { return `${this.BASE_URL}/api/v1`; },
    get ADMIN_API() { return `${this.BASE_URL}/api/admin`; }
};

/**
 * Controller quản lý thêm mới khuyến mãi
 */
app.controller('AddPromotionController', function($scope, $http, $timeout) {
    // ===== Khởi tạo các biến scope =====
    const initScopeVariables = () => {
        // Dữ liệu form khuyến mãi
        $scope.promotionData = {
            code: '',
            name: '',
            discountPercentage: '',
            startDate: null,
            endDate: null
        };
        
        // Các biến quản lý trạng thái
        $scope.validationErrors = [];
        $scope.isLoading = false;
        $scope.products = [];
        $scope.selectedProductDetails = [];
        $scope.checkedProductDetails = [];
        $scope.selectAll = false;
        $scope.lastCheckedIndex = -1; // Index item được chọn cuối cùng cho tính năng shift+click
    };

    // ===== Các service gọi API =====
    const apiService = {
        /**
         * Lấy danh sách sản phẩm
         */
        getProducts: () => {
            return $http.get(`${API_CONSTANTS.API_URL}/admin/products`)
                .then(response => response.data.date)
                .catch(error => {
                    console.error('Lỗi khi lấy danh sách sản phẩm:', error);
                    throw error;
                });
        },

        /**
         * Lấy chi tiết sản phẩm theo ID
         */
        getProductDetails: (productId) => {
            return $http.get(`${API_CONSTANTS.API_URL}/admin/items/product/${productId}`)
                .then(response => response.data.date)
                .catch(error => {
                    console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
                    throw error;
                });
        },

        /**
         * Tạo mới khuyến mãi
         */
        createPromotion: (promotionData) => {
            return $http.post(`${API_CONSTANTS.ADMIN_API}/promotions`, promotionData)
                .then(response => response.data)
                .catch(error => {
                    console.error('Lỗi khi tạo khuyến mãi:', error);
                    throw error;
                });
        },

        /**
         * Áp dụng khuyến mãi cho danh sách sản phẩm
         */
        applyPromotionToProducts: (promotionId, productDetailIds) => {
            return $http.post(
                `${API_CONSTANTS.ADMIN_API}/promotion-products/apply`,
                productDetailIds,
                { params: { promotionId: promotionId } }
            )
            .then(response => response.data)
            .catch(error => {
                console.error('Lỗi khi áp dụng khuyến mãi:', error);
                throw error;
            });
        }
    };

    // ===== Các hàm xử lý chọn sản phẩm =====
    /**
     * Xử lý toggle chọn một sản phẩm
     * Hỗ trợ chọn nhiều bằng shift+click
     */
    $scope.toggleSelection = (detail, index, $event) => {
        if (detail.status === 0 || detail.promotion) {
            detail.selected = false;
            return;
        }
    
        detail.selected = !detail.selected;
        $scope.lastCheckedIndex = index;
        updateSelectionStates();
    };
    

    /**
     * Chọn/bỏ chọn tất cả sản phẩm hợp lệ
     */
    $scope.toggleAllSelection = () => {
        const eligibleProducts = $scope.selectedProductDetails.filter(
            detail => detail.status === 1 && !detail.promotion
        );

        eligibleProducts.forEach(detail => {
            detail.selected = $scope.selectAll;
        });

        $scope.lastCheckedIndex = -1;
        $scope.updateCheckedList();
    };

    /**
     * Chọn sản phẩm theo trạng thái
     */
    $scope.selectByStatus = (status) => {
        $scope.selectedProductDetails.forEach(detail => {
            if (detail.status === status && !detail.promotion) {
                detail.selected = true;
            }
        });
        
        updateSelectionStates();
    };

    /**
     * Bỏ chọn tất cả sản phẩm
     */
    $scope.deselectAll = () => {
        $scope.selectedProductDetails.forEach(detail => {
            detail.selected = false;
        });
        
        $scope.selectAll = false;
        $scope.lastCheckedIndex = -1;
        $scope.updateCheckedList();
    };

    /**
     * Cập nhật danh sách sản phẩm đã chọn
     */
    $scope.updateCheckedList = () => {
        $scope.checkedProductDetails = $scope.selectedProductDetails.filter(
            detail => detail.selected && detail.status === 1 && !detail.promotion
        );
    };

    /**
     * Cập nhật trạng thái chọn tất cả
     */
    $scope.updateSelectAllState = () => {
        const eligibleProducts = $scope.selectedProductDetails.filter(
            detail => detail.status === 1 && !detail.promotion
        );

        $scope.selectAll = eligibleProducts.length > 0 && 
            eligibleProducts.every(detail => detail.selected);
    };

    /**
     * Cập nhật các trạng thái liên quan đến việc chọn sản phẩm
     */
    const updateSelectionStates = () => {
        $scope.updateCheckedList();
        $scope.updateSelectAllState();
    };

    // ===== Các hàm xử lý sản phẩm =====
    /**
     * Lấy danh sách sản phẩm từ API
     */
    $scope.fetchProducts = () => {
        $scope.isLoading = true;
        apiService.getProducts()
            .then(products => {
                $scope.products = products || [];
                if (!$scope.products.length) {
                    toastr.warning("Không có sản phẩm nào");
                }
            })
            .catch(() => {
                toastr.error("Lỗi khi tải danh sách sản phẩm");
            })
            .finally(() => {
                $scope.isLoading = false;
            });
    };

    /**
     * Chọn sản phẩm để xem chi tiết
     */
    $scope.selectProduct = (product) => {
        if (!product?.id) {
            console.error('Sản phẩm không hợp lệ:', product);
            return;
        }
        $scope.loadProductDetails(product.id);
    };

    /**
     * Tải chi tiết sản phẩm theo ID
     */
    $scope.loadProductDetails = (productId) => {
        apiService.getProductDetails(productId)
            .then(details => {
                // Tích hợp các sản phẩm chi tiết đã chọn từ trước
                details.forEach(detail => {
                    // Kiểm tra xem sản phẩm chi tiết này đã được chọn từ trước chưa
                    const isAlreadySelected = $scope.selectedProductDetails.some(
                        d => d.id === detail.id
                    );
                    if (!isAlreadySelected) {
                        detail.selected = false;
                        detail.productName = $scope.products.find(p => p.id === productId)?.name;
                        detail.imageUrl = detail.imageUrl || 'https://via.placeholder.com/50';
                        $scope.selectedProductDetails.push(detail);
                    }
                });
                resetSelectionStates();
            })
            .catch(() => {
                toastr.error("Lỗi khi tải chi tiết sản phẩm");
            });
    };
    

    // ===== Các hàm xử lý form và validate =====
    /**
     * Kiểm tra dữ liệu khuyến mãi
     */
    $scope.validatePromotion = () => {
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
                condition: !isValidDiscountPercentage($scope.promotionData.discountPercentage),
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

    /**
     * Kiểm tra giá trị phần trăm giảm giá
     */
    const isValidDiscountPercentage = (value) => {
        const discount = parseFloat(value);
        return !isNaN(discount) && discount > 0 && discount <= 90;
    };

    /**
     * Hiển thị lỗi tuần tự
     */
    const displayErrorsSequentially = (index = 0) => {
        if (index < $scope.validationErrors.length) {
            toastr.error($scope.validationErrors[index], '', {
                onHidden: () => {
                    $timeout(() => {
                        displayErrorsSequentially(index + 1);
                    }, 300);
                }
            });
        }
    };

    /**
     * Chuẩn bị dữ liệu khuyến mãi trước khi gửi lên server
     */
    const preparePromotionData = () => {
        const data = { ...$scope.promotionData };
        if (data.startDate) {
            data.startDate = new Date(data.startDate).toISOString();
        }
        if (data.endDate) {
            data.endDate = new Date(data.endDate).toISOString();
        }
        return data;
    };

    /**
     * Reset form và trạng thái chọn
     */
    const resetForm = () => {
        $scope.promotionData = {
            code: '',
            name: '',
            discountPercentage: '',
            startDate: null,
            endDate: null
        };
        resetSelectionStates();
    };

    /**
     * Reset các trạng thái liên quan đến chọn sản phẩm
     */
    const resetSelectionStates = () => {
        $scope.selectedProductDetails = $scope.selectedProductDetails.map(detail => ({
            ...detail,
            selected: false
        }));
        $scope.checkedProductDetails = [];
        $scope.selectAll = false;
        $scope.lastCheckedIndex = -1;
        $scope.validationErrors = [];
    };

    /**
     * Lưu khuyến mãi
     */
    $scope.savePromotion = () => {
        if (!$scope.validatePromotion()) {
            displayErrorsSequentially();
            return;
        }
    
        $scope.isLoading = true;
        const promotionData = preparePromotionData();
    
        // Tạo khuyến mãi và áp dụng cho tất cả sản phẩm chi tiết đã chọn
        apiService.createPromotion(promotionData)
            .then(createdPromotion => {
                const selectedIds = $scope.checkedProductDetails.map(detail => detail.id);
                if (selectedIds.length > 0) {
                    return apiService.applyPromotionToProducts(createdPromotion.id, selectedIds)
                        .then(() => {
                            toastr.success("Thêm và áp dụng khuyến mãi thành công!");
                            resetForm();
                            $scope.refreshCurrentProduct();
                        });
                } else {
                    toastr.warning("Chưa có sản phẩm chi tiết nào được chọn để áp dụng khuyến mãi.");
                }
            })
            .catch(() => {
                toastr.error("Lỗi khi thêm khuyến mãi");
            })
            .finally(() => {
                $scope.isLoading = false;
            });
    };
    

    /**
     * Làm mới danh sách sản phẩm hiện tại
     */
    $scope.refreshCurrentProduct = () => {
        $scope.fetchProducts();
    };

    // Khởi tạo controller
    (() => {
        initScopeVariables();
        $scope.fetchProducts();
    })();
});