// form-4-1

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('form41').addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(e.target);

        const response = await fetch('/api/adminRequest/addSupplier', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        const result = await response.json();

        if (result.success) {
            document.getElementById('form41').reset();
            alert(result.message);
        }
        else {
            alert(`新建失败：${result.message}`);
        }
    });
});

// 表单4-2逻辑：部分见managerpage2.js，存在函数的复用
// 参考函数：loadSupplierDataToForm42

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('form42').addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(e.target);

        if (!formData.has('supplierId')) {
            alert('请选择需要删除的供应商！');
            return;
        }

        // for (let [key, value] of formData.entries()) {
        //     console.log(`${key}: ${value}`);
        // }
        // return;

        const response = await fetch('/api/adminRequest/delSupplier', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        // 解析JSON响应
        const result = await response.json();
        if (result.success) {
            const selectElementIn42 = document.getElementById('form-4-2-basicSelect');
            const selectedOption = selectElementIn42.options[selectElementIn42.selectedIndex];

            if (selectedOption) {
                selectElementIn42.removeChild(selectedOption);
            }

            document.getElementById('form42').reset();
            document.getElementById('form-4-2-basicSelect').selectedIndex = 0;

            alert(result.message);
        }
        else {
            alert(`删除失败：${result.message}`);
        }
    })
})