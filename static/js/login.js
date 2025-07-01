// 切换表单
const upLeft = document.querySelector('.up-left');
const upRight = document.querySelector('.up-right');
const pageManager = document.querySelector('.page-manager');
const pageStudent = document.querySelector('.page-student');

function switchTab(selectedTab, otherTab, selectedPage, otherPage) {
    if (selectedTab.classList.contains('choosen-bacc')) return;

    otherTab.classList.remove('choosen-bacc');
    selectedTab.classList.add('choosen-bacc');
    otherPage.classList.add('hidden');
    selectedPage.classList.remove('hidden');
}

upLeft.addEventListener('click', () => {
    switchTab(upLeft, upRight, pageManager, pageStudent);
});

upRight.addEventListener('click', () => {
    switchTab(upRight, upLeft, pageStudent, pageManager);
});


// 管理员登录逻辑
const managerForm = document.querySelector('#managerForm');

managerForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(e.target);

    try {
        // 发送POST请求到后端API，验证账号密码是否正确
        const response = await fetch('api/login/manager', {
            method: 'POST',
            body: formData
        });

        // 解析JSON响应
        const result = await response.json();

        // 处理响应结果
        if (result.success) {
            // console.log(result.message);
            alert('登录成功，即将进入管理员页面。');

            // 保存session身份信息
            const timestamp = new Date().getTime();
            const targetURL = `${window.location.protocol}//${window.location.host}/api/userInnerPage/manageInner?t=${timestamp}`;

            const response = await fetch(targetURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ usrId: formData.get('managerName') }),
                credentials: 'include'
            });

            const data = await response.json();

            const link = document.createElement('a');
            link.href = `${window.location.protocol}//${window.location.host}/${data.url}`;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();

        } else {
            // console.log(result.message);
            alert(`登录失败：${result.message}`);
        }
    } catch (error) {
        // 处理网络错误或JSON解析错误
        console.error('登录错误:', error);
    }
});


// 学生登录逻辑
const studentForm = document.querySelector('#studentForm');

studentForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(e.target);

    try {
        // 发送POST请求到后端API
        const response = await fetch('api/login/student', {
            method: 'POST',
            body: formData
        });

        // 解析JSON响应
        const result = await response.json();

        // 处理响应结果
        if (result.success) {
            // console.log(result.message);
            alert('登录成功，即将进入个人主页。');

            // 保存session身份信息
            const timestamp = new Date().getTime();
            const targetURL = `${window.location.protocol}//${window.location.host}/api/userInnerPage/studentInner?t=${timestamp}`;

            const response = await fetch(targetURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ usrId: formData.get('stuID') }),
                credentials: 'include'
            });

            const data = await response.json();

            const link = document.createElement('a');
            link.href = `${window.location.protocol}//${window.location.host}/${data.url}`;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();

        } else {
            // console.log(result.message);
            alert(`登录失败：${result.message}`);
        }
    } catch (error) {
        // 处理网络错误或JSON解析错误
        console.error('登录错误:', error);
    }
});