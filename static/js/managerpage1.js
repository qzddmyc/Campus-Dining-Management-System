// 食材选择器功能-1-1
document.addEventListener('DOMContentLoaded', async function () {
    let ingredientsData = [];
    try {
        const response = await fetch('/api/adminRequest/getIngredientsData', {
            method: 'POST',
            credentials: 'include'
        });
        const result = await response.json();

        if (!result.success) {
            console.error(`获取信息失败: ${result.data}`);
        } else {
            ingredientsData = result.data || [];
        }

    } catch (error) {
        console.error('获取食材数据失败:', error);
    }

    // 测试数据
    // [
    //     { id: 1, name: "西红柿" },
    //     { id: 2, name: "土豆" },
    //     { id: 3, name: "洋葱" },
    //     { id: 4, name: "青椒" },
    //     { id: 5, name: "胡萝卜" },
    //     { id: 6, name: "西兰花" },
    //     { id: 7, name: "鸡蛋" },
    //     { id: 8, name: "牛肉" },
    //     { id: 9, name: "猪肉" },
    //     { id: 10, name: "鸡肉" },
    //     { id: 11, name: "大米" },
    //     { id: 12, name: "面粉" },
    //     { id: 13, name: "食用油" },
    //     { id: 14, name: "盐" },
    //     { id: 15, name: "糖" },
    //     { id: 16, name: "酱油" },
    //     { id: 17, name: "醋" },
    //     { id: 18, name: "姜" },
    //     { id: 19, name: "蒜" },
    //     { id: 20, name: "辣椒" }
    // ];

    // 用户选择的食材
    const selectedIngredients = {};

    // DOM 元素
    const ingredientsList = document.getElementById('ingredients-list');
    const selectedList = document.getElementById('selected-list');
    const selectedDataInput = document.getElementById('selected-ingredients-data');

    // 渲染食材列表
    function renderIngredients(ingredients) {
        ingredientsList.innerHTML = '';

        if (ingredients.length === 0) {
            ingredientsList.innerHTML = `
                <div class="empty-state">
                    <p>没有可用的食材</p>
                </div>
            `;
            return;
        }

        ingredients.forEach(ingredient => {
            const card = document.createElement('div');
            card.className = 'ingredient-item';
            card.innerHTML = `
                <div class="ingredient-info">
                    <h3>${ingredient.name}</h3>
                </div>
                <div class="ingredient-action">
                    <div class="action-btn add-btn" data-id="${ingredient.id}">&plus;</div>
                </div>
            `;

            card.querySelector('.add-btn').addEventListener('click', function () {
                addIngredient(ingredient);
            });

            ingredientsList.appendChild(card);
        });
    }

    // 渲染已选食材列表
    function renderSelectedIngredients() {
        const selectedItems = Object.values(selectedIngredients);

        if (selectedItems.length === 0) {
            selectedList.innerHTML = `
                <div class="empty-state">
                    <p>您还没有选择任何食材</p>
                </div>
            `;
            updateSelectedData();
            return;
        }

        selectedList.innerHTML = '';

        selectedItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'ingredient-item';
            card.innerHTML = `
                <div class="ingredient-info">
                    <h3>${item.name}</h3>
                </div>
                <div class="ingredient-action">
                    <div class="action-btn decrease-btn" data-id="${item.id}">&minus;</div>
                    <span class="quantity">${item.quantity}</span>
                    <div class="action-btn increase-btn" data-id="${item.id}">&plus;</div>
                    <div class="action-btn remove-btn" data-id="${item.id}">&times;</div>
                </div>
            `;

            // 增减按钮事件
            card.querySelector('.decrease-btn').addEventListener('click', function () {
                updateQuantity(item.id, -1);
            });

            card.querySelector('.increase-btn').addEventListener('click', function () {
                updateQuantity(item.id, 1);
            });

            card.querySelector('.remove-btn').addEventListener('click', function () {
                removeIngredient(item.id);
            });

            selectedList.appendChild(card);
        });

        updateSelectedData();
    }

    // 添加食材
    function addIngredient(ingredient) {
        if (selectedIngredients[ingredient.id]) {
            selectedIngredients[ingredient.id].quantity += 1;
        } else {
            selectedIngredients[ingredient.id] = {
                id: ingredient.id,
                name: ingredient.name,
                quantity: 1
            };
        }

        renderSelectedIngredients();
        updateAvailableIngredients();
    }

    // 更新已选食材数量
    function updateQuantity(ingredientId, change) {
        if (selectedIngredients[ingredientId]) {
            const newQuantity = selectedIngredients[ingredientId].quantity + change;

            if (newQuantity >= 1) {
                selectedIngredients[ingredientId].quantity = newQuantity;
                renderSelectedIngredients();
                updateAvailableIngredients();
            } else {
                removeIngredient(ingredientId);
            }
        }
    }

    // 移除已选食材
    function removeIngredient(ingredientId) {
        if (selectedIngredients[ingredientId]) {
            delete selectedIngredients[ingredientId];
            renderSelectedIngredients();
            updateAvailableIngredients();
        }
    }

    // 更新可用食材列表
    function updateAvailableIngredients() {
        const availableIngredients = ingredientsData.filter(ingredient => {
            return !selectedIngredients[ingredient.id];
        });

        renderIngredients(availableIngredients);
    }

    // 更新已选数据
    function updateSelectedData() {
        const data = Object.values(selectedIngredients).map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity
        }));

        selectedDataInput.value = JSON.stringify(data);
    }

    function clearAllSelectedIngredients() {
        const keys = Object.keys(selectedIngredients);

        if (keys.length === 0) {
            return;
        }

        keys.forEach(key => {
            delete selectedIngredients[key];
        });

        // 更新UI
        renderSelectedIngredients();
        updateAvailableIngredients();
    }

    // 初始化
    function init() {
        updateAvailableIngredients();
        renderSelectedIngredients();

        // 监听表单提交
        document.getElementById('form11').addEventListener('submit', async function (e) {
            e.preventDefault();

            // console.log('已选食材数据:', selectedDataInput.value);
            const formData = new FormData(e.target);
            // for (let [key, value] of formData.entries()) {
            //     console.log(`${key}: ${value}`);
            // }
            const response = await fetch('/api/adminRequest/addDish', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            // 解析JSON响应
            const result = await response.json();
            if (result.success) {
                clearAllSelectedIngredients();
                document.getElementById('form11').reset();
                alert('新建成功！');
            }
            else {
                alert(`新建失败：${result.message}`);
            }
        });
    }

    // 初始化
    init();
});

// 菜品选择框-1-2

document.addEventListener('DOMContentLoaded', async function () {
    // 数据应该是菜品，而非食材
    // const ingredientsData = [
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

    // 变量名应该是dishData，不再修改
    let ingredientsData = [];
    try {
        const response = await fetch('/api/adminRequest/getDishData', {
            method: 'POST',
            credentials: 'include'
        });
        const result = await response.json();

        if (!result.success) {
            console.error(`获取信息失败: ${result.data}`);
        } else {
            ingredientsData = result.data || [];
        }
    } catch (error) {
        console.error('获取食材数据失败:', error);
    }

    // 获取DOM元素
    const select = document.getElementById('foodSelect');
    const selectHeader = select.querySelector('#foodSelect .select-header');
    const selectOptions = document.getElementById('selectOptions');
    const selectTitle = select.querySelector('#foodSelect .select-title');

    const inputOfDishID = document.getElementById('input-dishID-form12');
    const inputOfDishPrice = document.getElementById('input-dishPrice-form12');
    const inputOfDishStock = document.getElementById('input-dishStock-form12');

    inputOfDishID.value = 'none';

    // 渲染选项
    function renderOptions(data) {
        selectOptions.innerHTML = '';

        if (!data || data.length === 0) {
            selectOptions.innerHTML = '<div class="select-option" style="color: #7d6cff88; cursor: not-allowed;">没有可选的菜品</div>';
            return;
        }

        data.forEach(item => {
            const option = document.createElement('div');
            option.className = 'select-option';
            option.textContent = item.name;
            option.setAttribute('data-value', item.id);

            selectOptions.appendChild(option);
        });

        // 重新绑定选项事件
        bindOptionEvents();
    }

    // 绑定选项点击事件
    function bindOptionEvents() {
        const options = selectOptions.querySelectorAll('#selectOptions .select-option');

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
                selectOptions.classList.remove('active');

                const selectedOption = selectOptions.querySelector('#selectOptions .select-option.selected');
                const selectedValue = selectedOption ? selectedOption.dataset.value : null;
                // selectedValue 即为菜品ID
                inputOfDishID.value = selectedValue;

                let nowJson;
                ingredientsData.forEach(jsonData => {
                    if (jsonData.id === selectedValue) {
                        nowJson = jsonData;
                    }
                });
                if (!nowJson) {
                    console.error("Query 'ingredientsData.forEach(jsonData => {' to find where is wrong.");
                }
                inputOfDishPrice.placeholder = `当前价格为: ${nowJson.price}`;
                inputOfDishStock.placeholder = `当前库存为: ${nowJson.stock}`;
            });
        });

    }

    // 初始化下拉框
    function initSelect() {
        // 渲染选项
        renderOptions(ingredientsData);

        // 切换下拉菜单显示/隐藏
        selectHeader.addEventListener('click', function () {
            selectHeader.classList.toggle('active');
            selectOptions.classList.toggle('active');
        });

        // 点击外部关闭下拉菜单
        document.addEventListener('click', function (e) {
            if (!select.contains(e.target)) {
                selectHeader.classList.remove('active');
                selectOptions.classList.remove('active');
            }
        });

        // 初始化表单form12提交事件
        document.getElementById('form12').addEventListener('submit', async function (e) {
            e.preventDefault();
            const formData = new FormData(e.target);

            if (formData.get('dishID') === 'updatedButNotRecord') {
                const selectedOption = document.querySelector('#txt12 .select-option.selected');
                const selectedValue = selectedOption ? selectedOption.dataset.value : 'none';

                formData.set('dishID', selectedValue);
            }

            if (formData.get('dishID') === 'none') {
                alert('请选择需要修改的菜品！');
                return;
            }

            // for (let [key, value] of formData.entries()) {
            //     console.log(`${key}: ${value}`);
            // }

            const response = await fetch('/api/adminRequest/modifyDish', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            // 解析JSON响应
            const result = await response.json();
            if (result.success) {
                document.getElementById('form12').reset();

                alert(result.message);

                const item = ingredientsData.find(item => item.id === formData.get('dishID'));
                item.price = formData.get('newDishPrice');
                item.stock = formData.get('newDishStock');
                const selectedOption = document.querySelector('#txt12 .select-option.selected');
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




// 菜品展示-1-3

const seasonMapping = {
    spring: { elementId: 'spring' },
    summer: { elementId: 'summer' },
    autumn: { elementId: 'autumn' },
    winter: { elementId: 'winter' }
};

// 数据展示函数 - 可重复调用
function renderSeasonDishes(data) {
    // 显示加载状态
    document.getElementById('form-1-3-loading').style.display = 'block';

    // 按季节分类数据
    const categorizedData = {
        spring: [],
        summer: [],
        autumn: [],
        winter: []
    };

    // 过滤数据并分类
    data.forEach(item => {
        if (item.season !== 'none' && seasonMapping[item.season]) {
            categorizedData[item.season].push(item);
        }
    });

    // 渲染分类数据
    Object.keys(categorizedData).forEach(season => {
        const items = categorizedData[season];
        const tableBody = document.getElementById(`form-1-3-${season}-table`);
        const countElement = document.getElementById(`form-1-3-${season}-count`);

        // 更新计数
        countElement.textContent = items.length;

        // 清空空状态
        tableBody.innerHTML = '';

        // 如果有数据，渲染表格行
        if (items.length > 0) {
            items.forEach(item => {
                const row = document.createElement('tr');
                const stockClass = item.stock < 5 ? 'form-1-3-stock-low' : '';
                row.innerHTML = `
              <td class="font-medium text-gray-900">${item.name}</td>
              <td>¥${item.price}</td>
              <td class="${stockClass}">${item.stock}</td>
            `;
                tableBody.appendChild(row);
            });
        } else {
            // 没有数据时显示空状态
            tableBody.innerHTML = `
            <tr>
              <td colspan="3" class="form-1-3-empty-state">暂无${season === 'spring' ? '春季' : season === 'summer' ? '夏季' : season === 'autumn' ? '秋季' : '冬季'}菜品</td>
            </tr>
          `;
        }
    });

    // 隐藏加载状态
    document.getElementById('form-1-3-loading').style.display = 'none';
}

// 模拟数据
// const mockData_for_13 = [
//     { id: 'D001', name: '芦笋沙拉', price: '28.00', stock: '15', season: 'spring' },
//     { id: 'D002', name: '草莓奶昔', price: '18.00', stock: '20', season: 'spring' },
//     { id: 'D003', name: '冰淇淋', price: '22.00', stock: '30', season: 'summer' },
//     { id: 'D004', name: '水果拼盘', price: '36.00', stock: '12', season: 'summer' },
//     { id: 'D005', name: '南瓜汤', price: '25.00', stock: '18', season: 'autumn' },
//     { id: 'D006', name: '烤栗子', price: '16.00', stock: '25', season: 'autumn' },
//     { id: 'D007', name: '热巧克力', price: '20.00', stock: '22', season: 'winter' },
//     { id: 'D008', name: '火锅套餐', price: '128.00', stock: '8', season: 'winter' },
//     { id: 'D009', name: '火锅套餐', price: '128.00', stock: '8', season: 'winter' },
//     { id: 'D00q', name: '火锅套餐', price: '128.00', stock: '8', season: 'winter' },
//     { id: 'D00w', name: '火锅套餐', price: '128.00', stock: '8', season: 'winter' },
//     { id: 'D00e', name: '火锅套餐', price: '128.00', stock: '8', season: 'winter' },
//     { id: 'D00r', name: '火锅套餐', price: '128.00', stock: '8', season: 'winter' }
// ];

// 页面加载时初始化数据

async function loadData_for_13() {
    let DishData_for_13 = [];
    try {
        const response = await fetch('/api/adminRequest/getDishData', {
            method: 'POST',
            credentials: 'include'
        });
        const result = await response.json();

        if (!result.success) {
            console.error(`获取信息失败: ${result.data}`);
        } else {
            DishData_for_13 = result.data || [];
        }
        return DishData_for_13;
    } catch (error) {
        console.error('获取食材数据失败:', error);
        return [];
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    const DishData_for_13 = await loadData_for_13();
    renderSeasonDishes(DishData_for_13);

    document.getElementById('form13').addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        // for (let [key, value] of formData.entries()) {
        //     console.log(`${key}: ${value}`);
        // }
        // return;
        const response = await fetch('/api/adminRequest/modifySeasonDish', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        // 解析JSON响应
        const result = await response.json();
        if (result.success) {
            document.getElementById('form13').reset();
            alert('季节性菜品上架成功！');
            const DishData_for_13 = await loadData_for_13();
            renderSeasonDishes(DishData_for_13);
        }
        else {
            alert(`上架失败：${result.message}`);
        }
    });
});