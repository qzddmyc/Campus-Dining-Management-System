const stuRegisterForm = document.querySelector('#stuRegister');

stuRegisterForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(e.target);

    try {
        // 发送POST请求到后端API
        const response = await fetch('/api/addStu', {
            method: 'POST',
            body: formData
        });

        // 解析JSON响应
        const result = await response.json();

        // 处理响应结果
        if (result.success) {
            console.log(result.message);
            alert('注册成功！即将返回登录页面。')
            const targetURL = `${window.location.protocol}//${window.location.host}/login-html`;
            // console.log(targetURL);
            
            window.location.replace(targetURL);

        } else {
            console.log(result.message);
            alert('注册失败：' + result.message);

        }
    } catch (error) {
        // 处理网络错误或JSON解析错误
        console.error('登录错误:', error);
    }
});