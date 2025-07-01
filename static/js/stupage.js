// 大页面切换函数
document.addEventListener('DOMContentLoaded', async function () {

    const leftButtons = document.querySelectorAll('.nav-item');
    const rightWholePages = document.querySelectorAll('.information');

    // 也可采用事件委托，但这里直接绑定事件至子元素。
    leftButtons.forEach(buts => {
        buts.addEventListener('click', function () {
            if (this.classList.contains('nav-choosen')) return;

            const targetId = this.dataset.tarid;

            document.querySelector('.left-area .nav-choosen').classList.remove('nav-choosen');
            this.classList.add('nav-choosen');

            rightWholePages.forEach(rightPage => {
                if (!rightPage.classList.contains('hidden')) {
                    rightPage.classList.add('hidden');
                }
            });
            document.getElementById(targetId).classList.remove('hidden');
        });
    });

});


document.addEventListener('DOMContentLoaded', async function () {
    // 获取学生信息
    async function getStuInfo() {
        try {
            const response = await fetch('/api/stuRequest/getStudentInfo', {
                method: 'POST',
                credentials: 'include'
            });
            const result = await response.json();

            if (!result.success) {
                alert(`获取学生信息失败: ${result.message}`);
                return [];
            } else {
                return result.data;
            }
        } catch (error) {
            console.error('获取学生信息错误:', error);
            return [];
        }
    }

    // 展示页面左下方的学生姓名
    async function show_stuName() {
        const show_stuName_area = document.querySelector('.left-area-lower-left');
        const stuData = await getStuInfo();
        if (stuData.length === 0) return;
        show_stuName_area.innerHTML = `你好，${stuData[0].stuName}`;
    }
    show_stuName();


    // page-s3的学生卡余额查询功能

    const query_balance_button = document.querySelector('.balance-area-query');
    query_balance_button.addEventListener('click', async () => {
        const stuData = await getStuInfo();
        if (stuData.length === 0) return;
        const show_balance_area = document.querySelector('.balance-area-show');
        show_balance_area.innerHTML = `您的学生卡（${stuData[0].stuCardID}）余额：${stuData[0].stuBalance}元`
    })

    // page-s4的学生id展示框
    async function show_stu_id() {
        const stuData = await getStuInfo();
        if (stuData.length === 0) return;
        const stuId_place = document.querySelector('#form-s4 .fake-ipt');
        stuId_place.innerHTML = stuData[0].stuId;
    }
    show_stu_id();

});

// page-s3学生卡充值功能
document.addEventListener('DOMContentLoaded', async function () {
    document.getElementById('form-s3').addEventListener('submit', async function (e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        // for (let [key, value] of formData.entries()) {
        //     console.log(`${key}: ${value}`);
        // }

        const response = await fetch('/api/stuRequest/addBalanceToStuCard', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        // 解析JSON响应
        const result = await response.json();

        if (result.success) {
            document.getElementById('form-s3').reset();
            alert(result.message);
            document.querySelector('.balance-area-query').click();
        }
        else {
            alert(`充值失败：${result.message}`);
        }
    })
});

// page-s2订单查询功能

document.addEventListener('DOMContentLoaded', async function () {

    // 加载表格函数
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
                case 'a_orderID':
                    th.textContent = '订单编号';
                    break;
                case 'b_orderTime':
                    th.textContent = '订单时间';
                    break;
                case 'c_orderType':
                    th.textContent = '订单类型';
                    break;
                case 'd_windowName':
                    th.textContent = '窗口名称';
                    break;
                case 'e_totalAmount':
                    th.textContent = '订单金额';
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
                if (column === 'a_orderID') {
                    td.innerHTML = `<span class="id-badge">${item[column]}</span>`;
                } else if (column === 'b_orderTime') {
                    td.innerHTML = `<span class="fs14">${item[column]}</span>`;
                }
                else if (column === 'c_orderType') {
                    td.textContent = item[column] === 'dining' ? '堂食' : '外卖';
                }
                else {
                    td.textContent = item[column];
                }

                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
    }

    // 首先展示一个空表
    loadTableData([], 'tableContainer-s2');

    // 点击后展示数据
    document.getElementById('query-for-s2').addEventListener('click', async function () {
        let data_for_tableContainer_s2 = [];
        try {
            const response = await fetch('/api/stuRequest/getStudentOrderData', {
                method: 'POST',
                credentials: 'include'
            });
            const result = await response.json();

            if (!result.success) {
                alert(`查询学生订单失败: ${result.message}`);
                data_for_tableContainer_s2 = [];
            } else {
                info = result.data || [];
                data_for_tableContainer_s2 = info;
                if (info.length === 0) {
                    alert("注意，您当前无任何订单信息。");
                }
            }
        } catch (error) {
            console.error('查询学生订单错误:', error);
            data_for_tableContainer_s2 = [];
        }

        loadTableData(data_for_tableContainer_s2, 'tableContainer-s2');
    })
})

// page-s1用户的点餐

document.addEventListener('DOMContentLoaded', async function () {

    // 最多两位小数的加法实现
    function add(a, b) {
        const intA = Math.round(a * 100);
        const intB = Math.round(b * 100);

        const resultInt = intA + intB;

        return (resultInt / 100).toFixed(2);
    }

    // const window_data_for_s1 = [
    //     { id: "1001", name: "窗口名" },
    //     { id: "1002", name: "窗口名" }
    // ];
    // 窗口的信息，建立后就不再更改
    let window_data_for_s1 = [];

    // 按窗口分类的菜品信息，可以重新加载、根据用户选择更改，或者作为表单信息提交。
    // 格式：
    // const dish_data_selected_by_windowId = {
    //     'window001':
    //         [
    //             { 'dishID': 'dish001', 'dishName': 'name', 'stock': 5, 'userSelect': 3, 'money': 10 },
    //             { 'dishID': 'dish002', 'dishName': 'name', 'stock': 4, 'userSelect': 1, 'money': 30 },
    //             { 'dishID': 'dish003', 'dishName': 'name', 'stock': 7, 'userSelect': 0, 'money': 60 }
    //         ],
    //     'window002':
    //         [
    //             { 'dishID': 'dish001', 'dishName': 'name', 'stock': 5, 'userSelect': 1, 'money': 10 },
    //             { 'dishID': 'dish003', 'dishName': 'name', 'stock': 7, 'userSelect': 1, 'money': 60 },
    //             { 'dishID': 'dish006', 'dishName': 'name', 'stock': 8, 'userSelect': 3, 'money': 70 }
    //         ]
    // }
    // 表示：window001这个窗口售卖三个菜品，以及菜品的名称、库存、用户的点餐量、菜品的单价
    let dish_data_selected_by_windowId = {};

    function isEmpty(obj) {
        return obj !== null && obj !== undefined && Object.keys(obj).length === 0;
    }

    async function update_array_dish_data() {
        try {
            const response = await fetch('/api/stuRequest/getDishData_selected_by_windows', {
                method: 'POST',
                credentials: 'include'
            });

            const result = await response.json();

            if (!result.success) {
                alert(`查询学生订单失败: ${result.message}`);
                dish_data_selected_by_windowId = {};
            } else {
                dish_data_selected_by_windowId = result.data;
            }
        } catch (error) {
            console.error('查询学生订单错误:', error);
            dish_data_selected_by_windowId = {};
        }
    }

    function modify_userSelect(windowID, dishID, dx) {
        // console.log(windowID, dishID, dx);

        try {
            infos = dish_data_selected_by_windowId[windowID];
        }
        catch (error) {
            alert(`Test: 错误！在modify_userSelect函数中：${error}`);
            return;
        }

        infos.forEach(info => {
            if (info.dishID === dishID) {
                const new_userSelect = info.userSelect + dx;
                if (new_userSelect < 0 || new_userSelect > info.stock) {
                    return;
                }
                else {
                    info.userSelect = new_userSelect;

                    // 更新总额
                    const money_area = document.querySelector('.sum-money-area');
                    const pre = Number(money_area.innerHTML.match(/\d+\.\d+|\d+/));
                    const suf = add(pre, Number(info.money) * Number(dx));
                    money_area.innerHTML = `总计：${suf}元`;

                    // 添加数据之后，可以直接重新渲染页面，也可以对页面.dish-number元素值再进行单独修改。
                    // show_special_window_data_to_page(windowID);
                    const dish_item = document.querySelector(`.page-s1-dishes-item[data-dishid="${dishID}"][data-windowid="${windowID}"]`);
                    if (new_userSelect > 0) {
                        dish_item.classList.add('user-selected-dish');
                    } else {
                        dish_item.classList.remove('user-selected-dish');
                    }
                    const dish_number = dish_item.querySelector('.dish-number');
                    dish_number.innerHTML = new_userSelect;
                    return;
                }
            }
        });

    }

    function show_special_window_data_to_page(windowId) {
        const summary_money_area = document.querySelector('.sum-money-area');
        summary_money_area.innerHTML = '总计：0.00元';

        if (windowId === 'default_') {
            const list_box_default = document.querySelector('.page-s1-dishes-container');
            list_box_default.innerHTML = '<div style="margin-top: 30px;">请选择窗口以展示菜品</div>';
            return;
        }

        try {
            infos = dish_data_selected_by_windowId[windowId];
        }
        catch (error) {
            alert(`Test: 错误！在show_special_window_data_to_page函数中：${error}`);
            return;
        }

        if (infos.length === 0) {
            const list_box_empty = document.querySelector('.page-s1-dishes-container');
            list_box_empty.innerHTML = '<div style="margin-top: 30px;">当前窗口无菜品出售中</div>';
            return;
        }

        let sum_money = 0;

        const list_box = document.querySelector('.page-s1-dishes-container');
        list_box.innerHTML = '';

        infos.forEach(info => {
            sum_money = add(sum_money, Number(info.userSelect) * Number(info.money));

            const option = document.createElement('div');
            option.classList.add('page-s1-dishes-item');
            option.dataset.dishid = info.dishID;
            option.dataset.windowid = windowId;
            option.innerHTML = `
                <div class="item-left">
                    <div class="item-left-up">${info.dishName}</div>
                    <div class="item-left-down">
                        <div class="item-stocks">库存：${info.stock}</div>
                        <div class="item-price">单价：${info.money}元</div>
                    </div>
                </div>
                <div class="item-right">
                    <div class="action-btn reduce">&minus;</div>
                    <div class="dish-number">${info.userSelect}</div>
                    <div class="action-btn add">&plus;</div>
                </div>
            `
            if (info.stock === 0) {
                option.classList.add('turn-gray');
            }
            if (info.userSelect > 0) {
                option.classList.add('user-selected-dish');
            }
            list_box.appendChild(option);
        });

        // 展示总额
        summary_money_area.innerHTML = `总计：${sum_money}元`;

        // 加减按钮的点击事件
        const options = document.querySelectorAll('.page-s1-dishes-item');
        options.forEach(option => {
            if (option.classList.contains('turn-gray')) {
                return;
            }

            const reduce_btn = option.querySelector('.reduce');

            reduce_btn.addEventListener('click', () => {
                modify_userSelect(option.dataset.windowid, option.dataset.dishid, -1);
            });
            const add_btn = option.querySelector('.add');
            add_btn.addEventListener('click', () => {
                modify_userSelect(option.dataset.windowid, option.dataset.dishid, 1);
            });
        })
    }

    // 获取window_data_for_s1信息（一次性）
    try {
        const response = await fetch('/api/stuRequest/getWindowData_stu', {
            method: 'POST',
            credentials: 'include'
        });

        const result = await response.json();

        if (!result.success) {
            alert(`获取窗口信息失败: ${result.message}`);
        } else {
            window_data_for_s1 = result.data || [];
        }
    } catch (error) {
        console.error('获取窗口信息失败:', error);
    }

    // 选择框
    const select = document.getElementById('ingreSelect-s1');
    // 选择框的用户选择展示区域
    const selectHeader = select.querySelector('#ingreSelect-s1 .select-header');
    // 里面是展示区域内的文字
    const selectTitle = select.querySelector('#ingreSelect-s1 .select-title');
    // 这是点击后展开的选择项区域。每一个选择项的自定义属性value存放指向的窗口id，显示的文字为窗口名称。
    const selectOptions_s1 = document.getElementById('selectOptions-s1');

    // 链接表单的隐藏input框，它的值表示用户选择的窗口id
    const inputOfWindowID = document.getElementById('input-windowId-form-s1');

    inputOfWindowID.value = 'none';

    // 渲染选项
    function renderOptions_s2(data) {
        selectOptions_s1.innerHTML = '';

        if (!data || data.length === 0) {
            selectOptions_s1.innerHTML = '<div class="select-option" style="color: #7d6cff88; cursor: not-allowed;">没有可选择的窗口</div>';
            return;
        }

        data.forEach(item => {
            const option = document.createElement('div');
            option.className = 'select-option';
            option.textContent = item.windowName;
            option.setAttribute('data-value', item.windowId);

            selectOptions_s1.appendChild(option);
        });

        // 重新绑定选项事件
        bindOptionEvents();
    }

    // 绑定选项点击事件
    function bindOptionEvents() {
        const options = selectOptions_s1.querySelectorAll('#selectOptions-s1 .select-option');

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
                selectOptions_s1.classList.remove('active');

                const selectedOption = selectOptions_s1.querySelector('#selectOptions-s1 .select-option.selected');
                const selectedValue = selectedOption ? selectedOption.dataset.value : null;
                // selectedValue 即为窗口ID，现在将它存入表单的input框的value中。
                inputOfWindowID.value = selectedValue;

                // 显示窗口为id的菜品
                show_special_window_data_to_page(selectedValue);
            });
        });
    }

    // 初始化下拉框
    function initSelect() {
        // 渲染选项
        renderOptions_s2(window_data_for_s1);

        // 切换下拉菜单显示/隐藏
        selectHeader.addEventListener('click', function () {
            selectHeader.classList.toggle('active');
            selectOptions_s1.classList.toggle('active');
        });

        // 点击外部关闭下拉菜单
        document.addEventListener('click', function (e) {
            if (!select.contains(e.target)) {
                selectHeader.classList.remove('active');
                selectOptions_s1.classList.remove('active');
            }
        });

        // 初始化表单form-s1提交事件
        document.getElementById('form-s1').addEventListener('submit', async function (e) {
            e.preventDefault();

            const formData = new FormData(e.target);

            if (formData.get('windowID') === 'none') {
                alert('请选择窗口并点餐');
                return;
            }

            const money_area_for_form = document.querySelector('.sum-money-area');
            const money = Number(money_area_for_form.innerHTML.match(/\d+\.\d+|\d+/));
            if (money === 0 || money === '0' || money === '0.00') {
                alert('您未点任何菜品');
                return;
            }
            formData.append('amount', money);

            // if (formData.get('ingreID') === 'updatedButNotRecord') {
            //     const selectedOption = document.querySelector('#txt22 .select-option.selected');
            //     const selectedValue = selectedOption ? selectedOption.dataset.value : 'none';

            //     formData.set('ingreID', selectedValue);
            // }

            const selectedDishes = dish_data_selected_by_windowId[formData.get('windowID')]
                .filter(dish => dish.userSelect !== 0)
                .map(dish => ({
                    dishId: dish.dishID,
                    userSelect: dish.userSelect
                }));

            formData.append('orderedDish', JSON.stringify(selectedDishes));

            // for (let [key, value] of formData.entries()) {
            //     console.log(`${key}: ${value}`);
            // }
            // return;

            const response = await fetch('/api/stuRequest/stuOrder', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            // 解析JSON响应
            const result = await response.json();
            if (result.success) {
                document.getElementById('form-s1').reset();

                alert(result.message);

                await update_array_dish_data();

                const now_selected_windowID = formData.get('windowID');
                show_special_window_data_to_page(now_selected_windowID);
                inputOfWindowID.value = now_selected_windowID;
            }
            else {
                alert(result.message);
            }
        });
    }

    // 启动应用
    await update_array_dish_data();
    show_special_window_data_to_page('default_');
    initSelect();
})

// page-s4
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('form-s4').addEventListener('submit', async function (e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        // for (let [key, value] of formData.entries()) {
        //     console.log(`${key}: ${value}`);
        // }

        const response = await fetch('/api/stuRequest/modifyStuPwd', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        // 解析JSON响应
        const result = await response.json();

        if (result.success) {
            document.getElementById('form-s4').reset();
            alert(result.message);

            const invisibleLink = document.createElement('a');
            invisibleLink.href = '/login-html';
            invisibleLink.style.display = 'none';
            document.body.appendChild(invisibleLink);
            invisibleLink.click();
        }
        else {
            alert(`修改密码失败：${result.message}`);
        }
    })
});