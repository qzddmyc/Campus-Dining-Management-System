import time
from config import ALLOWED_DELAY, DEFAULT_ADMIN_NAME
from flask import Blueprint, request, jsonify, render_template, session

from database import check_value_exists

usrInner_bp = Blueprint('usrInner', __name__, url_prefix='/api/userInnerPage')


# 管理员登录逻辑

@usrInner_bp.route('/manageInner', methods=['POST'])
def get_manageInnerPage():
    # 通过时间戳的校准，校验请求的发送源
    client_timestamp = request.args.get('t', type=int)

    if not client_timestamp:
        return jsonify({
            'success': False,
            'url': 'api/errors/404'
        })

    server_timestamp = int(time.time() * 1000)
    time_diff = abs(server_timestamp - client_timestamp) / 1000

    if time_diff <= ALLOWED_DELAY:
        # 保存session
        session['usrId'] = request.json.get('usrId')
        return jsonify({
            'success': True,
            'url': '/api/userInnerPage/theManagerInnerPage'
        })
    return jsonify({
        'success': False,
        'url': 'api/errors/401'
    })


# 二次确认，防止用户通过网址直接访问后台
@usrInner_bp.route('/theManagerInnerPage')
def goto_managerInnerPage():
    if session.get('usrId') == 'root':
        return render_template("userInnerPage/managerpage.html")
    return render_template("error/401.html")


# 普通用户登录逻辑

@usrInner_bp.route('/studentInner', methods=['POST'])
def get_studentInnerPage():
    # 通过时间戳的校准，校验请求的发送源
    client_timestamp = request.args.get('t', type=int)

    if not client_timestamp:
        return jsonify({
            'success': False,
            'url': 'api/errors/404'
        })

    server_timestamp = int(time.time() * 1000)
    time_diff = abs(server_timestamp - client_timestamp) / 1000

    if time_diff <= ALLOWED_DELAY:
        # 保存session（学生学号）
        session['usrId'] = request.json.get('usrId')
        return jsonify({
            'success': True,
            'url': '/api/userInnerPage/theStudentInnerPage'
        })
    return jsonify({
        'success': False,
        'url': 'api/errors/401'
    })


@usrInner_bp.route('/theStudentInnerPage')
def goto_studentInnerPage():
    session_uid = session.get('usrId')
    if session_uid is not None and session_uid != DEFAULT_ADMIN_NAME and check_value_exists('Student', 'StudentID', session_uid):
        return render_template("userInnerPage/stupage.html")
    return render_template("error/401.html")
