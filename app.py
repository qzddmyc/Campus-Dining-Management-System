import secrets
from flask import Flask, render_template, session

from database import get_db_connection
from src.login import login_bp
from src.addStu import addStu_bp
from src.usrInner import usrInner_bp
from src.errors import errors_bp
from src.adminInner import adminInner_bp
from src.stuInner import stuInner_bp

app = Flask(__name__)
app.register_blueprint(login_bp)
app.register_blueprint(addStu_bp)
app.register_blueprint(usrInner_bp)
app.register_blueprint(errors_bp)
app.register_blueprint(adminInner_bp)
app.register_blueprint(stuInner_bp)

# session密钥配置
SECRETKEY = secrets.token_hex(16)
app.secret_key = SECRETKEY


@app.route('/')
@app.route('/login-html')
def index():
    """首页路由"""
    session.clear()
    return render_template('login.html')


if __name__ == '__main__':
    checkIfConn = get_db_connection()
    if checkIfConn:
        checkIfConn.close()
        app.run(debug=False, port=8080)
    else:
        print("数据库未成功开启，使用\'sudo sc start MSSQLSERVER\'以开启数据库。")
