// form-62

function loadTableData_in6(data, containerId) {
    // 获取容器和表格元素
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`找不到ID为 "${containerId}" 的容器元素`);
        return;
    }

    const table = container.querySelector('table');
    if (!table) {
        console.error(`在容器 "${containerId}" 中找不到表格元素`);
        return;
    }

    // 清空表格
    table.innerHTML = '';

    if (!data || data.length === 0) {
        // console.error('没有数据可加载');
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const th = document.createElement('th');
        th.style.width = '100%';
        th.style.textAlign = 'center';
        th.style.backgroundColor = '#f5f5ff';
        th.style.color = '#7d6cffbb';
        th.style.cursor = 'not-allowed';
        th.textContent = '请点击上方按钮进行查询';
        headerRow.appendChild(th);
        thead.appendChild(headerRow);
        table.appendChild(thead);
        return;
    }

    // 从第一个数据项获取列名
    const columns = Object.keys(data[0]);

    // 创建表头
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // 计算每列宽度
    const columnWidth = 100 / columns.length;

    columns.forEach(column => {
        const th = document.createElement('th');
        th.style.width = `${columnWidth}%`;

        // 设置表头文本
        switch (column) {
            case 'a_idx':
                th.textContent = '排名';
                break;
            case 'dishName':
                th.textContent = '菜品名称';
                break;
            case 'sales':
                th.textContent = '销量';
                break;
            case 'b_idx':
                th.textContent = '绩效排名';
                break;
            case 'c_windowName':
                th.textContent = '窗口名称';
                break;
            case 'd_manager':
                th.textContent = '负责人';
                break;
            case 'e_money':
                th.textContent = '绩效总额';
                break;
            default:
                th.textContent = column.charAt(0).toUpperCase() + column.slice(1);
        }

        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // 创建表体
    const tbody = document.createElement('tbody');

    data.forEach((item) => {
        const tr = document.createElement('tr');

        columns.forEach(column => {
            const td = document.createElement('td');
            td.style.width = `${columnWidth}%`;

            // 根据列名设置单元格内容和样式
            if (column === 'a_idx' || column === 'b_idx') {
                td.innerHTML = `<span class="id-badge" style="font-size: 16px;">${item[column]}</span>`;
            } else {
                td.textContent = item[column];
            }

            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
}

document.addEventListener('DOMContentLoaded', async function () {
    loadTableData_in6([], 'tableContainer-62');

    document.getElementById('query-for-62').addEventListener('click', async function () {
        let data_for_tableContainer_62 = [];
        try {
            const response = await fetch('/api/adminRequest/getHot10Dish', {
                method: 'POST',
                credentials: 'include'
            });
            const result = await response.json();

            if (!result.success) {
                alert(`查询热门菜品失败: ${result.data}`);
                data_for_tableContainer_62 = [];
            } else {
                const Hot10DishInfo = result.data || [];
                data_for_tableContainer_62 = Hot10DishInfo;
                if (Hot10DishInfo.length === 0) {
                    alert("注意，当前无任何订单信息，无法获取排行。");
                }
            }
        } catch (error) {
            console.error('查询热门菜品错误:', error);
            data_for_tableContainer_62 = [];
        }

        loadTableData_in6(data_for_tableContainer_62, 'tableContainer-62');
    })
})

document.addEventListener('DOMContentLoaded', async function () {
    loadTableData_in6([], 'tableContainer-63');

    document.getElementById('query-for-63').addEventListener('click', async function () {
        let data_for_tableContainer_63 = [];
        try {
            const response = await fetch('/api/adminRequest/getWindowSales', {
                method: 'POST',
                credentials: 'include'
            });
            const result = await response.json();

            if (!result.success) {
                alert(`查询窗口绩效失败: ${result.data}`);
                data_for_tableContainer_63 = [];
            } else {
                WindowSalesInfo = result.data || [];
                data_for_tableContainer_63 = WindowSalesInfo;
                if (WindowSalesInfo.length === 0) {
                    alert("注意，当前无任何订单信息，无法获取窗口绩效。");
                }
            }
        } catch (error) {
            console.error('查询窗口绩效错误:', error);
            data_for_tableContainer_63 = [];
        }

        loadTableData_in6(data_for_tableContainer_63, 'tableContainer-63');
    })
})

// form-61

function loadTableData_in6_1(data, containerId) {

    function add(a, b) {
        const intA = Math.round(a * 100);
        const intB = Math.round(b * 100);

        const resultInt = intA + intB;

        return (resultInt / 100).toFixed(2);
    }

    // 获取容器和表格元素
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`找不到ID为 "${containerId}" 的容器元素`);
        return;
    }

    const table = container.querySelector('table');
    if (!table) {
        console.error(`在容器 "${containerId}" 中找不到表格元素`);
        return;
    }

    // 清空表格
    table.innerHTML = '';

    if (data.length === 0) {
        // console.error('没有数据可加载');
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const th = document.createElement('th');
        th.style.width = '100%';
        th.style.textAlign = 'center';
        th.style.backgroundColor = '#f5f5ff';
        th.style.color = '#7d6cffbb';
        th.style.cursor = 'not-allowed';
        th.textContent = '该时间段内没有订单信息';
        headerRow.appendChild(th);
        thead.appendChild(headerRow);
        table.appendChild(thead);
        return;
    }

    // 从第一个数据项获取列名
    const columns = Object.keys(data[0]);

    // 创建表头
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // 计算每列宽度
    const columnWidth = 100 / columns.length;

    columns.forEach(column => {
        const th = document.createElement('th');
        th.style.width = `${columnWidth}%`;

        // 设置表头文本
        switch (column) {
            case 'a_windowName':
                th.textContent = '窗口名称';
                break;
            case 'b_orderTime':
                th.textContent = '订单时间';
                break;
            case 'c_totalAmount':
                th.textContent = '订单金额';
                break;
            default:
                th.textContent = column.charAt(0).toUpperCase() + column.slice(1);
        }

        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    let TOTALAMOUNT = 0;

    // 创建表体
    const tbody = document.createElement('tbody');

    data.forEach((item) => {
        const tr = document.createElement('tr');
        let cnt = 0;
        columns.forEach(column => {
            cnt++;
            if (cnt === 3) {
                TOTALAMOUNT = add(TOTALAMOUNT, Number(item[column]));
            }
            const td = document.createElement('td');
            td.style.width = `${columnWidth}%`;

            td.textContent = item[column];

            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    const tr_sum = document.createElement('tr');
    for (let i = 0; i < 3; i++) {
        const td = document.createElement('td');
        td.style.width = `${columnWidth}%`;
        if (i === 2) {
            td.textContent = `总营业额：${TOTALAMOUNT}元`;
        }
        else {
            td.textContent = '------';
        }
        tr_sum.appendChild(td);
    }
    tbody.appendChild(tr_sum);

    table.appendChild(tbody);
}

document.addEventListener('DOMContentLoaded', async function () {
    document.getElementById('submit-button-61').addEventListener('click', () => {
        document.getElementById('form61').dispatchEvent(new Event('submit'));
    })

    document.getElementById('form61').addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        // for (let [key, value] of formData.entries()) {
        //     console.log(`${key}: ${value}`);
        // }

        try {
            const response = await fetch('/api/adminRequest/getOrdersBetweenDates', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const result = await response.json();

            if (!result.success) {
                alert(`错误：${result.message}`);
            } else {
                loadTableData_in6_1(result.data, 'tableContainer-61');
            }
        } catch (error) {
            console.error('查询时间段内的账单（统计营业额）错误:', error);
        }
    })
})