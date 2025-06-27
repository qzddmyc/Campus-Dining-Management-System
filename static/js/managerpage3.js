// form3-2

document.addEventListener('DOMContentLoaded', async function () {

    // const windowData_for_32 = [
    //     { 'id': 'WIN001', 'name': '川湘风味', 'manager': '张厨师' },
    //     { 'id': 'WIN002', 'name': '粤式点心', 'manager': '李厨师' },
    //     { 'id': 'WIN003', 'name': '北方面食', 'manager': '王厨师' },
    //     { 'id': 'WIN004', 'name': '西式快餐', 'manager': '赵厨师' },
    //     { 'id': 'WIN005', 'name': '日韩料理', 'manager': '刘厨师' },
    //     { 'id': 'WIN006', 'name': '家常小炒', 'manager': '陈厨师' }
    // ];

    let windowData_for_32 = [];

    async function get_windowData_for_32() {
        try {
            const response = await fetch('/api/adminRequest/getWindowData', {
                method: 'POST',
                credentials: 'include'
            });

            const result = await response.json();

            if (!result.success) {
                console.error(`获取信息失败: ${result.data}`);
                return [];
            } else {
                return result.data || [];
            }
        } catch (error) {
            console.error('获取窗口数据失败:', error);
            return [];
        }
    }

    windowData_for_32 = await get_windowData_for_32();

    // 获取DOM元素
    const select = document.getElementById('ingreSelect-32');
    const selectHeader = select.querySelector('#ingreSelect-32 .select-header');
    const selectOptions32 = document.getElementById('selectOptions32');
    const selectTitle = select.querySelector('#ingreSelect-32 .select-title');

    const inputOfWindowID = document.getElementById('input-windowID-form32');
    const inputOfWindowName = document.getElementById('input-windowName-form32');
    const inputOfWindowManager = document.getElementById('input-windowManager-form32');

    inputOfWindowID.value = 'none';

    // 渲染选项
    function renderOptions32(data) {
        selectOptions32.innerHTML = '';

        if (!data || data.length === 0) {
            selectOptions32.innerHTML = '<div class="select-option" style="color: #7d6cff88; cursor: not-allowed;">没有可选的窗口</div>';
            return;
        }

        data.forEach(item => {
            const option = document.createElement('div');
            option.className = 'select-option';
            option.textContent = item.name;
            option.setAttribute('data-value', item.id);

            selectOptions32.appendChild(option);
        });

        // 重新绑定选项事件
        bindOptionEvents();
    }

    // 绑定选项点击事件
    function bindOptionEvents() {
        const options = selectOptions32.querySelectorAll('#selectOptions32 .select-option');

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
                selectOptions32.classList.remove('active');

                const selectedOption = selectOptions32.querySelector('#selectOptions32 .select-option.selected');
                const selectedValue = selectedOption ? selectedOption.dataset.value : null;
                // selectedValue 即为窗口ID
                inputOfWindowID.value = selectedValue;

                let nowJson;
                windowData_for_32.forEach(jsonData => {
                    if (jsonData.id === selectedValue) {
                        nowJson = jsonData;
                    }
                });
                if (!nowJson) {
                    console.error("Query 'windowData_for_32.forEach(jsonData => {' to find where is wrong.");
                }
                inputOfWindowName.placeholder = `当前窗口名称为: ${nowJson.name}`;
                inputOfWindowManager.placeholder = `当前窗口负责人为: ${nowJson.manager}`;
            });
        });

    }

    // 初始化下拉框
    function initSelect() {
        // 渲染选项
        renderOptions32(windowData_for_32);

        // 切换下拉菜单显示/隐藏
        selectHeader.addEventListener('click', function () {
            selectHeader.classList.toggle('active');
            selectOptions32.classList.toggle('active');
        });

        // 点击外部关闭下拉菜单
        document.addEventListener('click', function (e) {
            if (!select.contains(e.target)) {
                selectHeader.classList.remove('active');
                selectOptions32.classList.remove('active');
            }
        });

        // 初始化表单form32提交事件
        document.getElementById('form32').addEventListener('submit', async function (e) {
            e.preventDefault();
            const formData = new FormData(e.target);

            if (formData.get('windowID') === 'updatedButNotRecord') {
                const selectedOption = document.querySelector('#txt32 .select-option.selected');
                const selectedValue = selectedOption ? selectedOption.dataset.value : 'none';

                formData.set('windowID', selectedValue);
            }

            if (formData.get('windowID') === 'none') {
                alert('请选择需要修改的窗口！');
                return;
            }

            // for (let [key, value] of formData.entries()) {
            //     console.log(`${key}: ${value}`);
            // }
            // return;

            const response = await fetch('/api/adminRequest/modifyWindow', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            // 解析JSON响应
            const result = await response.json();
            if (result.success) {
                document.getElementById('form32').reset();

                alert(result.message);

                windowData_for_32 = await get_windowData_for_32();
                renderOptions32(windowData_for_32);

                const selectableOptions = document.querySelectorAll('#txt32 .select-option');

                // 因为无法判断用户是否使得窗口存在同名情况，所以重新在下拉列表中找到原项并写回#txt32 .select-header较为复杂。这里直接重置选中项为第一项。
                if (selectableOptions.length > 0) {
                    selectableOptions[0].click();
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

// form-3-1

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('form31').addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(e.target);

        const response = await fetch('/api/adminRequest/addWindow', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        const result = await response.json();

        if (result.success) {
            document.getElementById('form31').reset();
            alert(result.message);
        }
        else {
            alert(`新建失败：${result.message}`);
        }
    });
});

// form-33

document.addEventListener('DOMContentLoaded', function () {
    async function get_windowData_for_33() {
        try {
            const response = await fetch('/api/adminRequest/getWindowData', {
                method: 'POST',
                credentials: 'include'
            });

            const result = await response.json();

            if (!result.success) {
                console.error(`获取信息失败: ${result.data}`);
                return [];
            } else {
                return result.data || [];
            }
        } catch (error) {
            console.error('获取窗口数据失败:', error);
            return [];
        }
    }

    async function drawWindows_for_33() {
        const windowContainer = document.querySelector('.page33-windows-container');
        const WindowData = await get_windowData_for_33();
        windowContainer.innerHTML = '';

        if (WindowData.length === 0) {
            const option = document.createElement('div');
            option.classList.add('page33-windows-item');
            option.classList.add('disabled');
            option.textContent = '无可选的窗口';
            windowContainer.appendChild(option);
            return;
        }

        WindowData.forEach(item => {
            const option = document.createElement('div');
            option.classList.add('page33-windows-item');
            option.textContent = item.name;
            option.setAttribute('data-windowid', item.id);

            windowContainer.appendChild(option);
        });

        const all_items = document.querySelectorAll('.page33-windows-item');

        all_items.forEach(item => {
            item.addEventListener('click', function () {
                if (this.classList.contains('choosen')) {
                    return;
                }

                const choosen = document.querySelector('.page33-windows-item.choosen');
                if (choosen) {
                    choosen.classList.remove('choosen');
                }
                this.classList.add('choosen');

                show_dish_to_the_page(this.dataset.windowid);
            });
        });
        all_items[0].click();
    }

    async function getAllDish() {
        // [{'id': item['DishID'], 'name': item['DishName'], ...}, {...}]
        try {
            const response = await fetch('/api/adminRequest/getDishData', {
                method: 'POST',
                credentials: 'include'
            });
            const result = await response.json();

            if (!result.success) {
                console.error(`获取信息失败: ${result.data}`);
                return [];
            } else {
                return result.data || [];
            }
        } catch (error) {
            console.error('获取食材数据失败:', error);
            return [];
        }
    }

    async function get_dishIds_from_sales_by_windowId(windowId) {
        // return an array like [{'dishId': item['DishID']} for item in result]
        try {
            const response = await fetch('/api/adminRequest/getSalesData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: windowId,
                credentials: 'include'
            });

            const result = await response.json();

            if (!result.success) {
                console.error(`获取信息失败: ${result.data}`);
                return [];
            } else {
                return result.data || [];
            }
        } catch (error) {
            console.error('获取窗口销售的菜品信息失败:', error);
            return [];
        }
    }

    async function show_dish_to_the_page(windowId) {
        const dishId_on_sale = await get_dishIds_from_sales_by_windowId(windowId);
        const dishId_of_all = await getAllDish();

        const not_on_sale_place = document.querySelector('.page33-dishes-left-container');
        const on_sale_place = document.querySelector('.page33-dishes-right-container');

        not_on_sale_place.innerHTML = '';
        on_sale_place.innerHTML = '';

        dishId_of_all.forEach(dish => {

            let onSale = false;
            for (let i = 0; i < dishId_on_sale.length; i++) {
                if (dishId_on_sale[i].dishId === dish.id) {
                    onSale = true;
                    break;
                }
            }
            if (onSale) {
                const option = document.createElement('div');
                option.classList.add('page33-dishes-item');
                option.classList.add('onright');
                option.textContent = dish.name;
                option.addEventListener('click', async function () {
                    const dishID = dish.id;
                    const res = await modifyDishToWindow(dishID, windowId, 'drop');
                    if (!res) {
                        alert('修改失败');
                    }
                    const windowId_ = windowId;
                    show_dish_to_the_page(windowId_);
                })
                on_sale_place.appendChild(option);
            } else {
                const option = document.createElement('div');
                option.classList.add('page33-dishes-item');
                option.classList.add('onleft');
                option.textContent = dish.name;
                option.addEventListener('click', async function () {
                    const dishID = dish.id;
                    const res = await modifyDishToWindow(dishID, windowId, 'add');
                    if (!res) {
                        alert('修改失败');
                    }
                    const windowId_ = windowId;
                    show_dish_to_the_page(windowId_);
                })
                not_on_sale_place.appendChild(option);
            }
        })

        if (not_on_sale_place.innerHTML === '') {
            not_on_sale_place.innerHTML = '所有菜品均出售中'
        }
        if (on_sale_place.innerHTML === '') {
            on_sale_place.innerHTML = '无任何菜品出售中'
        }

    }

    async function modifyDishToWindow(dishId, windowId, handle) {
        const data = {
            dishId: dishId,
            windowId: windowId,
            handle: handle
        };

        const jsonString = JSON.stringify(data);

        try {
            const response = await fetch('/api/adminRequest/modifyDishToWindow', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: jsonString,
                credentials: 'include'
            });

            const result = await response.json();

            if (!result.success) {
                console.error(`修改Sales失败：${result.message}`);
                return false;
            }
            return true;
        } catch (error) {
            console.error('修改Sales失败:', error);
            return false;
        }

    }

    drawWindows_for_33();

})