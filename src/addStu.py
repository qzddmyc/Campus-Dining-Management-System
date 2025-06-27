from flask import Blueprint, request, jsonify, render_template
from database import check_value_exists, execute_non_query, save_password

addStu_bp = Blueprint('addStu', __name__, url_prefix='/api/addStu')


@addStu_bp.route('/addStu-html')
def idx_addStu():
    return render_template('addStu/addStu.html')


@addStu_bp.route('/', methods=['POST'])
def addStu():
    stuID = request.form.get('stuID')
    stuName = request.form.get('stuName')
    stuCardID = request.form.get('stuCardID')
    pwd = request.form.get('pwd')

    # 检查学号是否存在，如果存在返回注册失败。
    studentID_exist = check_value_exists('Student', 'StudentID', stuID)
    if studentID_exist:
        return jsonify({
            'success': False,
            'message': '该学号已存在'
        })

    card_have_owner = check_value_exists('Student', 'CardID', stuCardID)
    if card_have_owner:
        return jsonify({
            'success': False,
            'message': '该学生卡已被绑定'
        })

    card_exist_in_StudentCard = check_value_exists('StudentCard', 'CardID', stuCardID)
    if not card_exist_in_StudentCard:
        query = "INSERT INTO StudentCard (CardID, Balance) VALUES (?, 0)"
        success = execute_non_query(query, (stuCardID,))
        if not success:
            return jsonify({
                'success': False,
                'message': "新建学生卡时出现异常"
            })

    query = "INSERT INTO Student (StudentID, Name, CardID) VALUES (?, ?, ?)"
    value = (stuID, stuName, stuCardID)
    try:
        success_stu = execute_non_query(query, value)
        if not success_stu:
            raise RuntimeError("学生表添加信息失败")

        success_pwd = save_password(stuID, pwd)
        if not success_pwd:
            raise RuntimeError("密码表添加信息失败")

    except RuntimeError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        })

    return jsonify({
        'success': True,
        'message': "创建新用户成功"
    })
