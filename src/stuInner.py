from flask import Blueprint, request, jsonify, session
from decimal import Decimal
from datetime import datetime
import json

from config import DEFAULT_ADMIN_NAME
from database import execute_query, execute_non_query, check_value_exists, verify_stuAccount_password, update_stuAccount_password

stuInner_bp = Blueprint('stuInner', __name__, url_prefix='/api/stuRequest')


@stuInner_bp.route('/getStudentInfo', methods=['POST'])
def getStudentInfo():
    stuId = session.get('usrId')
    if not stuId:
        return jsonify({
            'success': False,
            'message': "401 Forbidden, please login"
        })
    if stuId == DEFAULT_ADMIN_NAME:
        return jsonify({
            'success': False,
            'message': "403 Forbidden, you are the admin, not student"
        })
    if not check_value_exists('Student', 'StudentID', stuId):
        return jsonify({
            'success': False,
            'message': "403 Forbidden, student not found"
        })

    query = """
        SELECT 
            s.Name AS StuName,
            s.CardID AS StuCardID,
            sc.Balance AS StuBalance
        FROM 
            Student s
        JOIN 
            StudentCard sc ON s.CardID = sc.CardID
        WHERE 
            s.StudentID = ?;
    """

    values = (stuId,)

    result = execute_query(query, values)

    if result is None:
        return jsonify({
            'success': False,
            'message': '数据库查询失败'
        })

    formatted_data = [
        {'stuName': item['StuName'], 'stuCardID': item['StuCardID'], 'stuBalance': item['StuBalance'], 'stuId': stuId}
        for item in result]

    # 返回 JSON 响应
    return jsonify({
        'success': True,
        'data': formatted_data
    })


@stuInner_bp.route('/addBalanceToStuCard', methods=['POST'])
def addBalanceToStuCard():
    stuId = session.get('usrId')
    if not stuId:
        return jsonify({
            'success': False,
            'message': "401 Forbidden, please login"
        })
    if stuId == DEFAULT_ADMIN_NAME:
        return jsonify({
            'success': False,
            'message': "403 Forbidden, you are the admin, not student"
        })
    if not check_value_exists('Student', 'StudentID', stuId):
        return jsonify({
            'success': False,
            'message': "403 Forbidden, student not found"
        })

    addBalance = request.form.get('recharge')

    query = """
        UPDATE StudentCard 
        SET Balance = Balance + ? 
        WHERE CardID = (SELECT CardID FROM Student WHERE StudentID = ?);
    """

    values = (addBalance, stuId)

    success = execute_non_query(query, values)

    if not success:
        return jsonify({
            'success': False,
            'message': "数据库执行失败"
        })

    return jsonify({
        'success': True,
        'message': "充值成功"
    })


@stuInner_bp.route('/getStudentOrderData', methods=['POST'])
def getStudentOrderData():
    stuId = session.get('usrId')
    if not stuId:
        return jsonify({
            'success': False,
            'message': "401 Forbidden, please login"
        })
    if stuId == DEFAULT_ADMIN_NAME:
        return jsonify({
            'success': False,
            'message': "403 Forbidden, you are the admin, not student"
        })
    if not check_value_exists('Student', 'StudentID', stuId):
        return jsonify({
            'success': False,
            'message': "403 Forbidden, student not found"
        })

    query = """
            SELECT 
                od.OrderID AS OrderID,
                od.OrderType AS OrderType,
                FORMAT(od.OrderTime, 'yyyy-MM-dd HH:mm:ss') AS OrderTime,
                od.TotalAmount AS TotalAmount,
                w.WindowName AS WindowName
            FROM 
                Student s
            JOIN 
                OrderDetail od ON s.CardID = od.CardID
            JOIN 
                Window w ON od.WindowID = w.WindowID
            WHERE 
                s.StudentID = ?
            ORDER BY 
                od.OrderTime ASC;
        """

    result = execute_query(query, (stuId,))

    if result is None:
        return jsonify({
            'success': False,
            "message": "数据库查询失败"
        })

    # 转换数据格式
    formatted_data = [{'a_orderID': item['OrderID'], 'c_orderType': item['OrderType'], 'b_orderTime': item['OrderTime'],
                       'e_totalAmount': item['TotalAmount'], 'd_windowName': item['WindowName']} for item in result]

    # 返回 JSON 响应
    return jsonify({
        'success': True,
        "data": formatted_data
    })


@stuInner_bp.route('/getWindowData_stu', methods=['POST'])
def getWindowData_stu():
    stuId = session.get('usrId')
    if not stuId:
        return jsonify({
            'success': False,
            'message': "401 Forbidden, please login"
        })
    if stuId == DEFAULT_ADMIN_NAME:
        return jsonify({
            'success': False,
            'message': "403 Forbidden, you are the admin, not student"
        })
    if not check_value_exists('Student', 'StudentID', stuId):
        return jsonify({
            'success': False,
            'message': "403 Forbidden, student not found"
        })

    query = "SELECT WindowID, WindowName, Manager FROM Window"

    result = execute_query(query)

    if result is None:
        return jsonify({
            'success': False,
            "message": "数据库查询失败"
        })

    formatted_data = [{'windowId': item['WindowID'], 'windowName': item['WindowName'], 'manager': item['Manager']}
                    for item in result]

    return jsonify({
        'success': True,
        "data": formatted_data
    })


@stuInner_bp.route('/getDishData_selected_by_windows', methods=['POST'])
def getDishData_selected_by_windows():
    stuId = session.get('usrId')
    if not stuId:
        return jsonify({
            'success': False,
            'message': "401 Forbidden, please login"
        })
    if stuId == DEFAULT_ADMIN_NAME:
        return jsonify({
            'success': False,
            'message': "403 Forbidden, you are the admin, not student"
        })
    if not check_value_exists('Student', 'StudentID', stuId):
        return jsonify({
            'success': False,
            'message': "403 Forbidden, student not found"
        })

    windows_query = "SELECT WindowID FROM Window"
    windows = execute_query(windows_query)

    if not windows:
        return jsonify({
            'success': True,
            'message': "no window info",
            'data': {}
        })

    result = {}

    # 遍历每个窗口，查询其销售的菜品
    for window in windows:
        window_id = window['WindowID']

        # 查询该窗口销售的菜品信息
        dishes_query = """
                SELECT 
                    d.DishID AS dishID, 
                    d.DishName AS dishName,
                    d.DishStock AS stock,
                    0 AS userSelect,
                    d.Price AS money
                FROM 
                    Sale s
                JOIN 
                    Dish d ON s.DishID = d.DishID
                WHERE 
                    s.WindowID = ?
                ORDER BY
                    CASE WHEN d.DishStock > 0 THEN 0 ELSE 1 END,
                    d.DishID;
            """

        dishes = execute_query(dishes_query, (window_id,))

        result[window_id] = dishes

    return jsonify({
        "success": True,
        "message": "success",
        "data": result
    })


@stuInner_bp.route('/stuOrder', methods=['POST'])
def stuOrder():
    stuId = session.get('usrId')
    if not stuId:
        return jsonify({
            'success': False,
            'message': "401 Forbidden, please login"
        })
    if stuId == DEFAULT_ADMIN_NAME:
        return jsonify({
            'success': False,
            'message': "403 Forbidden, you are the admin, not student"
        })
    if not check_value_exists('Student', 'StudentID', stuId):
        return jsonify({
            'success': False,
            'message': "403 Forbidden, student not found"
        })

    mealStyle = request.form.get('mealStyle')
    windowId = request.form.get('windowID')
    # 变为json数据，不然这条数据是字符串
    orderedDish = json.loads(request.form.get('orderedDish'))
    amount = request.form.get('amount')

    # print(mealStyle, windowId, orderedDish, amount, sep='\n')

    # 查询学生卡余额
    query1 = """
            SELECT 
                sc.Balance
            FROM 
                Student s
            JOIN 
                StudentCard sc ON s.CardID = sc.CardID
            WHERE 
                s.StudentID = ?
        """

    result1 = execute_query(query1, (stuId,))

    if not result1:
        return jsonify({
            'success': False,
            'message': "查询学生卡余额失败"
        })

    # 学生卡剩余金额
    res_money = result1[0]['Balance']
    # 该账单花费金额
    decimal_amount = Decimal(amount)

    if res_money < decimal_amount:
        return jsonify({
            'success': False,
            'message': "下单失败：学生卡余额不足！"
        })

    # 查询订单的最大编号
    query2 = """
            SELECT MAX(OrderID) AS MaxOrderID
            FROM OrderDetail;
        """
    result2 = execute_query(query2)

    if not result2:
        return jsonify({
            'success': False,
            'message': "查询订单编号失败"
        })

    # 自动生成下一条订单编号。值得注意的是，这里可能会造成并发问题！暂不做修改。
    def get_order_number_add1(s):
        number = int(s[3::]) + 1
        str_number = str(number)
        str_number = str_number if len(str_number) > 3 else '0' * (3 - len(str_number)) + str(number)
        return 'ORD' + str_number

    now_max_order_id = result2[0]['MaxOrderID']

    # 订单编号
    this_order_id = get_order_number_add1(now_max_order_id)

    # 订单时间
    orderTime = datetime.now()

    # 1. 查找学生对应的学生卡
    card_query = """
            SELECT CardID 
            FROM Student 
            WHERE StudentID = ?
        """
    card_result = execute_query(card_query, (stuId,))
    card_id = card_result[0]['CardID'] if card_result else None

    # 2. 扣除学生卡金额
    update_balance_query = """
            UPDATE StudentCard 
            SET Balance = Balance - ? 
            WHERE CardID = ?
        """
    update_success = execute_non_query(update_balance_query, (decimal_amount, card_id))

    # 3. 添加订单信息到OrderDetail
    order_query = """
            INSERT INTO OrderDetail (OrderID, OrderType, OrderTime, TotalAmount, CardID, WindowID)
            VALUES (?, ?, ?, ?, ?, ?)
        """
    order_success = execute_non_query(order_query, (
        this_order_id, mealStyle, orderTime, decimal_amount, card_id, windowId
    ))

    # 4. 添加订单包含的菜品到OrderItem, 并且在菜品表中减少对应的库存数量
    for dish in orderedDish:
        item_query = """
                INSERT INTO OrderItem (DishID, OrderID, QuantityOfDish)
                VALUES (?, ?, ?)
            """
        item_success = execute_non_query(item_query, (
            dish['dishId'], this_order_id, dish['userSelect']
        ))

        update_stock_query = """
                    UPDATE Dish
                    SET DishStock = DishStock - ?
                    WHERE DishID = ?
                """
        stock_success = execute_non_query(update_stock_query, (dish['userSelect'], dish['dishId']))

        if not item_success or not stock_success:
            return jsonify({
                'success': False,
                'message': '数据库错误1'
            })

    if not update_success or not order_success:
        return jsonify({
            'success': False,
            'message': '数据库错误2'
        })

    return jsonify({
        'success': True,
        'message': f"下单成功！你的订单编号为{this_order_id}"
    })


@stuInner_bp.route('/modifyStuPwd', methods=['POST'])
def modifyStuPwd():
    stuId = session.get('usrId')
    if not stuId:
        return jsonify({
            'success': False,
            'message': "401 Forbidden, please login"
        })
    if stuId == DEFAULT_ADMIN_NAME:
        return jsonify({
            'success': False,
            'message': "403 Forbidden, you are the admin, not student"
        })
    if not check_value_exists('Student', 'StudentID', stuId):
        return jsonify({
            'success': False,
            'message': "403 Forbidden, student not found"
        })

    pwd_old = request.form.get('pwd_old')
    pwd_new1 = request.form.get('pwd_new1')
    pwd_new2 = request.form.get('pwd_new2')

    if not pwd_new1 == pwd_new2:
        return jsonify({
            'success': False,
            'message': '两次输入的新密码不同！'
        })

    if not verify_stuAccount_password(stuId, pwd_old):
        return jsonify({
            'success': False,
            'message': "原密码错误！"
        })

    if pwd_old == pwd_new1:
        return jsonify({
            'success': False,
            'message': "新密码不能与旧密码相同！"
        })

    success = update_stuAccount_password(stuId, pwd_new1)
    if not success:
        return jsonify({
            'success': False,
            'message': "数据库错误，密码重置错误！"
        })

    if not verify_stuAccount_password(stuId, pwd_new2):
        return jsonify({
            'success': False,
            'message': '密码加密出现错误！'
        })

    return jsonify({
        'success': True,
        'message': "密码修改成功！即将返回登录界面"
    })
