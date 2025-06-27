// form-5-1

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('form51').addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(e.target);

        const response = await fetch('/api/adminRequest/addStudentCard', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        const result = await response.json();

        if (result.success) {
            document.getElementById('form51').reset();
            alert(result.message);
        }
        else {
            alert(`新建失败：${result.message}`);
        }
    });
});

// form-5-2

function loadTableData_in5(data, containerId) {
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
            case 'a_cardId':
                th.textContent = '学生卡卡号';
                break;
            case 'balance':
                th.textContent = '学生卡余额';
                break;
            case 'studentId':
                th.textContent = '学生学号';
                break;
            case 'studentName':
                th.textContent = '学生姓名';
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
            if (column === 'a_cardId' || (column === 'studentId' && item[column])) {
                td.innerHTML = `<span class="id-badge">${item[column]}</span>`;
            } else {
                if (!item[column]) {
                    td.textContent = '未绑定';
                    td.classList.add('no-info-in-form');
                }
                else {
                    td.textContent = item[column];
                }
            }

            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
}

document.addEventListener('DOMContentLoaded', async function () {
    loadTableData_in5([], 'tableContainer-52');

    document.getElementById('query-for-52').addEventListener('click', async function () {
        let data_for_tableContainer_52 = [];
        try {
            const response = await fetch('/api/adminRequest/getStudentCardData', {
                method: 'POST',
                credentials: 'include'
            });
            const result = await response.json();

            if (!result.success) {
                alert(`查询学生卡信息失败: ${result.data}`);
                data_for_tableContainer_52 = [];
            } else {
                const StudentCardInfos = result.data || [];
                data_for_tableContainer_52 = StudentCardInfos;
                if (StudentCardInfos.length === 0) {
                    alert("当前无学生卡信息，请新建。");
                }
            }
        } catch (error) {
            console.error('查询学生卡信息错误:', error);
            data_for_tableContainer_52 = [];
        }

        loadTableData_in5(data_for_tableContainer_52, 'tableContainer-52');
    })
})