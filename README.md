# Campus Dining Management System

## 简介

- 这是高校食堂餐饮管理系统。
- 技术栈：
  - 前端：原生 HTML、CSS、JavaScript
  - 后端：Python Flask 框架
  - 数据库：SQL Server
- 功能：
  - 用户登录与注册功能。其中，用户包括管理员与学生两类。
  - 管理员具有管理菜品、食材、窗口与供应商，管理学生信息，以及数据分析的权限。
  - 学生具有点餐、账单查询、学生卡充值、登录密码修改的权限。
<br/>
 
## 环境配置

> 说明：启用本项目前，需要确保 SQL Server 与 Python 环境被正确配置。
> 
> 注意，这份项目是基于 SQL Server 的 Windows 身份验证连接（免密连接）实现的。如果数据库的连接需要身份验证，请自行修改命令行，以及 config.py 与 database.py 中的文件配置信息。其基本格式如下：
```python
# config.py

DB_CONFIG = {
    'driver': '{ODBC Driver 17 for SQL Server}',
    'server': 'localhost',
    'database': f'{DB_NAME}',
    'user': username,
    'password': password
}
```
```python
# database.py

connection = pyodbc.connect(
    f"DRIVER={DB_CONFIG['driver']};"
    f"SERVER={DB_CONFIG['server']};"
    f"DATABASE={DB_CONFIG['database']};"
    f"UID={DB_CONFIG['user']};"
    f"PWD={DB_CONFIG['password']}"
)
```
<br/>

#### 配置步骤：
1. 开启数据库服务（Windows 11 24H2 +）：
```batch
sudo sc start MSSQLSERVER
```
2. 建立名为 DiningManagementSystem 的空数据库：
```batch
sqlcmd -S localhost -Q "CREATE DATABASE DiningManagementSystem"
```
> 加密连接：
> ```batch
> sqlcmd -S localhost -U username -P password -Q "CREATE DATABASE DiningManagementSystem"
> ```

3. 安装所需的 Python 三方库：
```batch
pip install -r requirements.txt
```
4. 使用 initial_db.py 对数据库一键初始化：
```batch
python -m initdatabase.initial_db
```
5. 运行 app.py 以开启服务：
```batch
python app.py
```
6. 在浏览器中访问以下网址，即可进入项目页面：
```plaintext
http://127.0.0.1:8080
```
> 如果遇到端口占用的情况，请前往 app.py 修改 app.run 方法中的端口值
<br/>

## 说明
- 管理员的账号为 root，密码为 admin，无法通过该管理系统更改，但可以从 config.py 中修改以下默认值：
```python
ADMIN_ID = "root"
ADMIN_PASSWORD = "admin"
```
> 注意，这里的默认值修改后，页面中表单输入框内的 placeholder 值并不会改变。如果需要同步设置，请前往 templates/login.html 文件中自行修改
- 学生的初始账号密码请前往 initdatabase/initial_db.py 中查看。
- 在database文件夹中存在一个 checkreference.sql 文件，这是数据库触发器的设置文件，在初始化时并未被执行，也不建议执行。
- 由于一定的限制，在实现部分的“添加信息”、“信息一键修改”等功能后，需要刷新浏览器页面，才可以使其他页面中的新信息被渲染出来。
