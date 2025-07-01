// form-2-1的供应商查询与自动生成

async function getSupplierData() {
    let SupplierDetails = [];
    try {
        const response = await fetch('/api/adminRequest/getSupplierDetails', {
            method: 'POST',
            credentials: 'include'
        });
        const result = await response.json();

        if (!result.success) {
            console.error(`获取供应商信息失败: ${result.data}`);
            return [];
        } else {
            SupplierDetails = result.data || [];
            return SupplierDetails;
        }
    } catch (error) {
        console.error('获取供应商信息错误:', error);
        return [];
    }
};

function loadSupplierDataToForm21(data) {
    const selectElement = document.getElementById('form-2-1-basicSelect');

    selectElement.innerHTML = '';

    if (data && data.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = '无可选的供应商';
        option.disabled = true;
        selectElement.appendChild(option);
        return;
    }

    // 自动填充选项
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        selectElement.appendChild(option);
    });
}

function loadSupplierDataToForm42(data) {

    const selectElement = document.getElementById('form-4-2-basicSelect');

    selectElement.innerHTML = '';

    if (data && data.length === 0) {
        const option = document.createElement('option');
        option.value = 'notSelected';
        option.textContent = '无可删除的供应商';
        option.selected = true;
        option.disabled = true;
        selectElement.appendChild(option);
        return;
    } else {
        const option = document.createElement('option');
        option.value = 'notSelected';
        option.textContent = '请选择...';
        option.selected = true;
        option.disabled = true;
        selectElement.appendChild(option);
    }

    // 自动填充选项
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        selectElement.appendChild(option);
    });

    // 表单form-4-2绑定下拉框的选择事件
    const form42_selector = document.querySelector('#form42 .form-4-2-custom-select');
    form42_selector.addEventListener('change', function (e) {
        const data_ = data;
        let now_item;
        for (let i = 0; i < data_.length; i++) {
            if (data_[i].id === e.target.value) {
                now_item = data_[i];
                break;
            }
        }
        if (!now_item) {
            alert('Error in form42_selector.event_change');
            return;
        }
        const ipt_address = document.querySelector('#txt42 .ipt-address');
        const ipt_contact = document.querySelector('#txt42 .ipt-contact');
        ipt_address.value = now_item.address;
        ipt_contact.value = now_item.phone;
    })
}

document.addEventListener('DOMContentLoaded', async function () {
    const SupplierData = await getSupplierData();
    loadSupplierDataToForm21(SupplierData);
    loadSupplierDataToForm42(SupplierData);
})

// 表单form-21的提交

document.addEventListener('DOMContentLoaded', async function () {
    document.getElementById('form21').addEventListener('submit', async function (e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        // for (let [key, value] of formData.entries()) {
        //     console.log(`${key}: ${value}`);
        // }

        const response = await fetch('/api/adminRequest/addIngredient', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        // 解析JSON响应
        const result = await response.json();

        if (result.success) {
            document.getElementById('form21').reset();

            alert(result.message);
        }
        else {
            alert(`修改失败：${result.message}`);
        }
    });
})

// 表单2-2

document.addEventListener('DOMContentLoaded', async function () {
    // const ingreData_for_22 = [
    //     { id: "1001", name: "西红柿" },
    //     { id: "1002", name: "土豆" },
    //     { id: "1003", name: "洋葱" },
    //     { id: "1004", name: "青椒" },
    //     { id: "1005", name: "胡萝卜" },
    //     { id: "1006", name: "西兰花" },
    //     { id: "1007", name: "鸡蛋" },
    //     { id: "1008", name: "牛肉" },
    //     { id: "1009", name: "猪肉" },
    //     { id: "1010", name: "鸡肉" },
    //     { id: "1011", name: "大米" },
    //     { id: "1012", name: "面粉" },
    //     { id: "1013", name: "食用油" },
    //     { id: "1014", name: "盐" },
    //     { id: "1015", name: "糖" },
    //     { id: "1016", name: "酱油" },
    //     { id: "1017", name: "醋" },
    //     { id: "1018", name: "姜" },
    //     { id: "1019", name: "蒜" },
    //     { id: "1020", name: "辣椒" }
    // ];

    let ingreData_for_22 = [];
    try {
        const response = await fetch('/api/adminRequest/getIngredientsData', {
            method: 'POST',
            credentials: 'include'
        });

        const result = await response.json();

        if (!result.success) {
            console.error(`获取信息失败: ${result.data}`);
        } else {
            ingreData_for_22 = result.data || [];
        }
    } catch (error) {
        console.error('获取食材数据失败:', error);
    }

    // 获取DOM元素
    const select = document.getElementById('ingreSelect-22');
    const selectHeader = select.querySelector('#ingreSelect-22 .select-header');
    
    const selectOptions22 = document.getElementById('selectOptions22');
    const selectTitle = select.querySelector('#ingreSelect-22 .select-title');

    const inputOfIngreID = document.getElementById('input-ingreID-form22');
    const inputOfThreshold = document.getElementById('input-ingreThreshold-form22');
    const inputOfIngreStock = document.getElementById('input-ingreStock-form22');

    inputOfIngreID.value = 'none';

    // 渲染选项
    function renderOptions22(data) {
        selectOptions22.innerHTML = '';

        if (!data || data.length === 0) {
            selectOptions22.innerHTML = '<div class="select-option" style="color: #7d6cff88; cursor: not-allowed;">没有可选的食材</div>';
            return;
        }

        data.forEach(item => {
            const option = document.createElement('div');
            option.className = 'select-option';
            option.textContent = item.name;
            option.setAttribute('data-value', item.id);

            selectOptions22.appendChild(option);
        });

        // 重新绑定选项事件
        bindOptionEvents();
    }

    // 绑定选项点击事件
    function bindOptionEvents() {
        const options = selectOptions22.querySelectorAll('#selectOptions22 .select-option');

        options.forEach(option => {
            // 跳过禁用的选项
            if (option.style.cursor === 'not-allowed') return;

            option.addEventListener('click', function () {
                // 更新选中状态
                options.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');

                // 更新标题
                selectTitle.textContent = this.textContent;

                // 隐藏下拉菜单
                selectHeader.classList.remove('active');
                selectOptions22.classList.remove('active');

                const selectedOption = selectOptions22.querySelector('#selectOptions22 .select-option.selected');
                const selectedValue = selectedOption ? selectedOption.dataset.value : null;
                // selectedValue 即为食材ID
                inputOfIngreID.value = selectedValue;

                let nowJson;
                ingreData_for_22.forEach(jsonData => {
                    if (jsonData.id === selectedValue) {
                        nowJson = jsonData;
                    }
                });
                if (!nowJson) {
                    console.error("Query 'ingreData_for_22.forEach(jsonData => {' to find where is wrong.");
                }
                inputOfThreshold.placeholder = `当前阈值为: ${nowJson.threshold}`;
                inputOfIngreStock.placeholder = `当前库存为: ${nowJson.stock}`;
            });
        });

    }

    // 初始化下拉框
    function initSelect() {
        // 渲染选项
        renderOptions22(ingreData_for_22);

        // 切换下拉菜单显示/隐藏
        selectHeader.addEventListener('click', function () {
            selectHeader.classList.toggle('active');
            selectOptions22.classList.toggle('active');
        });

        // 点击外部关闭下拉菜单
        document.addEventListener('click', function (e) {
            if (!select.contains(e.target)) {
                selectHeader.classList.remove('active');
                selectOptions22.classList.remove('active');
            }
        });

        // 初始化表单form22提交事件
        document.getElementById('form22').addEventListener('submit', async function (e) {
            e.preventDefault();
            const formData = new FormData(e.target);

            if (formData.get('ingreID') === 'updatedButNotRecord') {
                const selectedOption = document.querySelector('#txt22 .select-option.selected');
                const selectedValue = selectedOption ? selectedOption.dataset.value : 'none';

                formData.set('ingreID', selectedValue);
            }

            if (formData.get('ingreID') === 'none') {
                alert('请选择需要修改的食材！');
                return;
            }

            if (formData.get('ingredientSupplierId') === 'notSelected') {
                // 实际并不执行，被选中时，formData并不存在该选项
                alert('请选择需要修改的供应商！');
                return;
            }

            // for (let [key, value] of formData.entries()) {
            //     console.log(`${key}: ${value}`);
            // }
            // return;

            const response = await fetch('/api/adminRequest/modifyIngredient', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            // 解析JSON响应
            const result = await response.json();
            if (result.success) {
                document.getElementById('form22').reset();
                document.getElementById('form-2-2-basicSelect').selectedIndex = 0;

                alert(result.message);

                const item = ingreData_for_22.find(item => item.id === formData.get('ingreID'));
                item.stock = formData.get('newIngreStock');
                item.threshold = formData.get('newIngreThreshold');
                const selectedOption = document.querySelector('#txt22 .select-option.selected');
                if (selectedOption) {
                    selectedOption.click();
                }
            }
            else {
                alert(`修改失败：${result.message}`);
            }
        });
    }

    // 启动应用
    initSelect();
})

// form-22中的供应商生成

function loadSupplierDataToForm22(data) {
    const selectElement = document.getElementById('form-2-2-basicSelect');

    selectElement.innerHTML = '';

    if (data && data.length === 0) {
        const option = document.createElement('option');
        option.value = 'notSelected';
        option.textContent = '无可选的供应商';
        option.selected = true;
        option.disabled = true;
        selectElement.appendChild(option);
        return;
    } else {
        const option = document.createElement('option');
        option.value = 'notSelected';
        option.textContent = '不修改供应商信息';
        option.selected = true;
        option.disabled = true;
        selectElement.appendChild(option);
    }

    // 自动填充选项
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        selectElement.appendChild(option);
    });
}

document.addEventListener('DOMContentLoaded', async function () {
    const SupplierData = await getSupplierData();
    loadSupplierDataToForm22(SupplierData);
})

// 生成表格的函数

function loadTableData(data, containerId) {
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
        th.textContent = '无数据，请点击查询，或当前食材库存均足够';
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
            case 'id':
                th.textContent = '食材ID';
                break;
            case 'name':
                th.textContent = '食材名称';
                break;
            case 'stock':
                th.textContent = '当前库存量';
                break;
            case 'threshold':
                th.textContent = '食材阈值';
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
            if (column === 'id') {
                td.innerHTML = `<span class="id-badge">${item[column]}</span>`;
            } else {
                td.textContent = item[column];
            }

            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
}

document.addEventListener('DOMContentLoaded', function () {
    loadTableData([], 'tableContainer-23');

    document.querySelector('.button-23-for-query-table').addEventListener('click', async function () {
        let data_for_tableContainer_23 = [];
        try {
            const response = await fetch('/api/adminRequest/getIngredientsDataBelowThreshold', {
                method: 'POST',
                credentials: 'include'
            });
            const result = await response.json();

            if (!result.success) {
                console.error(`获取低于阈值的食材信息信息失败: ${result.data}`);
                data_for_tableContainer_23 = [];
            } else {
                const SupplierDetails = result.data || [];
                data_for_tableContainer_23 = SupplierDetails;
                if (SupplierDetails.length === 0) {
                    alert("所有食材库存均大于阈值，无需采购");
                }
            }
        } catch (error) {
            console.error('获取低于阈值的食材信息信息错误:', error);
            data_for_tableContainer_23 = [];
        }
        loadTableData(data_for_tableContainer_23, 'tableContainer-23');

        const buttonForBuyFood = document.querySelector('.button-23-for-buy-food');
        if (buttonForBuyFood.classList.contains('not-allowed-to-click') && data_for_tableContainer_23.length !== 0) {
            buttonForBuyFood.classList.remove('not-allowed-to-click');
        }
    })

    document.querySelector('.button-23-for-buy-food').addEventListener('click', async function (e) {
        if (e.target.classList.contains('not-allowed-to-click')) {
            return;
        }

        try {
            const response = await fetch('/api/adminRequest/buyIngredientsBelowThresholdToIt', {
                method: 'POST',
                credentials: 'include'
            });

            const result = await response.json();

            if (!result.success) {
                console.error(result.data);
                alert(result.data);
            } else {
                alert(result.data);
            }
        } catch (error) {
            console.error('修改食材库存（采购）时出现错误:', error);
        }

        loadTableData([], 'tableContainer-23');
        e.target.classList.add('not-allowed-to-click');
    })
})