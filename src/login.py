from config import ADMIN_ID, ADMIN_PASSWORD

from flask import Blueprint, request, jsonify

from database import verify_stuAccount_password, check_value_exists

login_bp = Blueprint('login', __name__, url_prefix='/api/login')


@login_bp.route('/manager', methods=['POST'])
def manager_login():
    manager_name = request.form.get('managerName')
    manager_pwd = request.form.get('pwd')

    if manager_name == ADMIN_ID and manager_pwd == ADMIN_PASSWORD:
        return jsonify({
            'success': True,
            'message': '登录成功'
        })
    else:
        return jsonify({
            'success': False,
            'message': '用户名或密码错误'
        })


@login_bp.route('/student', methods=['POST'])
def student_login():
    student_id = request.form.get('stuID')
    student_pwd = request.form.get('pwd')

    if not check_value_exists('Password', 'StudentID', student_id):
        return jsonify({
            'success': False,
            'message': '用户不存在'
        })

    correct = verify_stuAccount_password(student_id, student_pwd)

    if correct:
        return jsonify({
            'success': True,
            'message': '登录成功'
        })
    else:
        return jsonify({
            'success': False,
            'message': '账号或密码错误'
        })
