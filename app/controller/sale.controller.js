app.controller('SalesController', function($scope) {
    let invoiceCount = 1; // Đếm số hóa đơn

    // Hàm tạo tab mới
    function createNewTab(invoiceNumber) {
        // Tạo tab mới
        const newTab = document.createElement('li');
        newTab.classList.add('nav-item');
        newTab.innerHTML = `
            <a class="nav-link" id="invoice-${invoiceNumber}-tab" data-bs-toggle="tab" href="#invoice-${invoiceNumber}" 
            role="tab" aria-controls="invoice-${invoiceNumber}" aria-selected="false">
            Hóa đơn ${invoiceNumber}
            </a>
        `;

        // Tạo nội dung cho tab mới
        const newTabContent = document.createElement('div');
        newTabContent.classList.add('tab-pane', 'fade');
        newTabContent.id = `invoice-${invoiceNumber}`;
        newTabContent.setAttribute('role', 'tabpanel');
        newTabContent.setAttribute('aria-labelledby', `invoice-${invoiceNumber}-tab`);
        newTabContent.innerHTML = `
            <h5>Hóa đơn ${invoiceNumber}</h5>
            <p>Chi tiết của hóa đơn ${invoiceNumber}...</p>
        `;

        // Thêm tab và nội dung vào giao diện
        document.getElementById('invoiceTab').appendChild(newTab);
        document.getElementById('invoiceTabContent').appendChild(newTabContent);
    }

    // Xử lý sự kiện click cho nút tạo hóa đơn
    document.getElementById('createInvoiceBtn').addEventListener('click', function () {
        invoiceCount++;
        createNewTab(invoiceCount);

        // Kích hoạt tab mới
        const newTab = document.querySelector(`#invoice-${invoiceCount}-tab`);
        const tab = new bootstrap.Tab(newTab);
        tab.show();
    });

    // Xử lý sự kiện chuyển đổi tab
    document.getElementById('invoiceTab').addEventListener('shown.bs.tab', function (event) {
        const activeTab = event.target.getAttribute("href"); // ID của tab đang mở
        console.log(`Đang mở tab: ${activeTab}`);
    });
});