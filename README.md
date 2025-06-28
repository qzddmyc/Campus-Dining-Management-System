# Campus Dining Management System

## 简介

- 这是高校食堂餐饮管理系统。
- 环境：
  - 前端：HTML、CSS、JavaScript
  - 后端：Python Flask框架
  - 数据库：SQL Server
- 功能：
  - 用户登录与注册功能。其中，用户包括管理员与学生两类。
  - 管理员具有管理菜品、食材、窗口与供应商，管理学生信息，以及数据分析的权限。
  - 学生具有点餐、学生卡充值、登录密码修改的权限。
 
## 环境配置

> 说明：启用本项目前，需要确保SQL Server与Python环境被正确配置。注意，这份环境配置及项目文件是基于Windows系统，且SQL Server通过Windows身份验证连接（免密连接）实现的。如果数据库的连接需要身份验证，请自行修改命令行，以及config.py与database.py中的文件配置信息。两者基本格式如下：
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
1. 运行以下命令开启数据库服务：
```batch
sudo sc start MSSQLSERVER
```
2. 建立名为DiningManagementSystem的数据库。可以通过SQL Server手动建立，或执行以下命令建立：
```batch
sqlcmd -Q "CREATE DATABASE DiningManagementSystem"
```
3. 执行以下命令，以确保Python三方库被正确安装：
```batch
pip install -r requirements.txt
```
4. 执行initdatabase/initial_db.py，对数据库中的测试数据进行初始化：
> 注意，请使用下方命令行来执行，而不是直接运行对应的文件
```batch
 python -m initdatabase.initial_db
```
5. 运行app.py以开启服务：
```batch
python app.py
```
6. 在浏览器中访问以下网址，即可进入项目页面：
> 如果遇到端口占用的情况，请前往app.py中修改app.run方法中的端口值
```plaintext
http://127.0.0.1:8080
```

## 说明
- 管理员的账号为root，密码为admin，无法通过该管理系统更改，但可以从config.py中修改以下默认值：
> 注意，这里的默认值修改后，页面中表单输入框内的placeholder值并不会改变。如果需要同步设置，请前往templates/login.html文件中自行修改
```python
ADMIN_ID = "root"
ADMIN_PASSWORD = "admin"
```
- 学生的初始账号密码请前往initdatabase/initial_db.py中查看。
- 在database文件夹中存在一个checkreference.sql文件，这是数据库触发器的设置文件，在初始化时并未被执行，也不建议执行。
