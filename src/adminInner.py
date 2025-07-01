from flask import Blueprint, request, jsonify, session
import json
from datetime import datetime

from config import DEFAULT_ADMIN_NAME
from database import execute_query, execute_non_query, check_value_exists

adminInner_bp = Blueprint('adminInner', __name__, url_prefix='/api/adminRequest')


@adminInner_bp.route('/getIngredientsData', methods=['POST'])
def getIngredientsData():
    if session.get('usrId') != DEFAULT_ADMIN_NAME:
        return jsonify({
            'success': False,
            'data': "401 Forbidden"
        })

    query = "SELECT IngredientID, IngredientName, Unit, Stock, Threshold, SupplierID FROM Ingredient"

    result = execute_query(query)

    if result is None:
        # 查询失败，返回错误响应
        return jsonify({
            'success': False,
            "data": "数据库查询失败"
        })

    # 转换数据格式
    formatted_data = [
        {'id': item['IngredientID'], 'name': item['IngredientName'], 'unit': item['Unit'], 'stock': item['Stock'],
         'threshold': item['Threshold'], 'supplierId': item['SupplierID']} for item in result]

    # 返回 JSON 响应
    return jsonify({
        'success': True,
        "data": formatted_data
    })


@adminInner_bp.route('/getDishData', methods=['POST'])
def getDishData():
    if session.get('usrId') != DEFAULT_ADMIN_NAME:
        return jsonify({
            'success': False,
            'data': "401 Forbidden"
        })

    query = "SELECT DishID, DishName, Price, DishStock, SeasonalAttribute FROM Dish"

    result = execute_query(query)

    if result is None:
        # 查询失败，返回错误响应
        return jsonify({
            'success': False,
            "data": "数据库查询失败"
        })

    # 转换数据格式
    formatted_data = [
        {'id': item['DishID'], 'name': item['DishName'], 'price': item['Price'], 'stock': item['DishStock'],
         'season': item['SeasonalAttribute']}
        for item in result]

    # 返回 JSON 响应
    return jsonify({
        'success': True,
        "data": formatted_data
    })


def insert_dish(dishID, dishName, dishPrice, dishStock, dishSeason):
    # SQL 插入语句
    query = """
    INSERT INTO Dish (DishID, DishName, Price, DishStock, SeasonalAttribute)
    VALUES (?, ?, ?, ?, ?)
    """

    # 参数化查询
    params = (dishID, dishName, dishPrice, dishStock, dishSeason)

    # 执行插入操作
    return execute_non_query(query, params)


def insert_production_records(dishID, selectedIngredients):
    # 检查是否有食材数据
    if not selectedIngredients:
        return True  # 没有食材关联，视为成功

    # 构建批量插入的 SQL 语句
    query = ""
    params = []
    for ingredient in selectedIngredients:
        # 为每个食材添加一条 INSERT 语句
        query += """
        INSERT INTO Production (IngredientID, DishID, QuantityOfIngredient)
        VALUES (?, ?, ?);
        """
        # 添加对应参数
        params.extend([ingredient["id"], dishID, ingredient["quantity"]])

    # 执行批量插入
    return execute_non_query(query, params)


def create_new_dish(dishID, dishName, dishPrice, dishStock, dishSeason, selectedIngredients):
    try:
        # 插入菜品信息
        dish_success = insert_dish(dishID, dishName, dishPrice, dishStock, dishSeason)

        if not dish_success:
            raise Exception("插入菜品信息失败")

        # 插入食材关联信息
        production_success = insert_production_records(dishID, selectedIngredients)

        if not production_success:
            raise Exception("插入食材关联信息失败")

        return True  # 所有操作成功
    except Exception as e:
        print(f"创建菜品失败: {e}")
        return False


@adminInner_bp.route('/addDish', methods=['POST'])
def addDish():
    dishID = request.form.get('dishID')

    if check_value_exists('Dish', 'DishID', dishID):
        return jsonify({
            'success': False,
            'message': '菜品ID已存在'
        })

    dishName = request.form.get('dishName')
    dishPrice = request.form.get('dishPrice')
    dishStock = request.form.get('dishStock')
    selectedIngredients = json.loads(request.form.get('selectedIngredients'))
    dishSeason = request.form.get('dishSeason')

    success = create_new_dish(
        dishID, dishName, dishPrice, dishStock, dishSeason, selectedIngredients
    )
    if success:
        return jsonify({
            'success': True,
            'message': '...'
        })
    else:
        return jsonify({
            'success': False,
            'message': '数据库错误！'
        })


@adminInner_bp.route('/modifyDish', methods=['POST'])
def modifyDish():
    if session.get('usrId') != DEFAULT_ADMIN_NAME:
        return jsonify({
            'success': False,
            'message': "401 Forbidden"
        })

    dishID = request.form.get('dishID')
    newDishPrice = request.form.get('newDishPrice')
    newDishStock = request.form.get('newDishStock')

    set_clauses = []
    params = []

    if newDishPrice is not None:
        set_clauses.append("Price = ?")
        params.append(newDishPrice)

    if newDishStock is not None:
        set_clauses.append("DishStock = ?")
        params.append(newDishStock)

    # 添加主键条件
    params.append(dishID)

    # 构建完整SQL
    query = f"UPDATE Dish SET {', '.join(set_clauses)} WHERE DishID = ?"

    # 执行数据库更新
    success = execute_non_query(query, params)
    if success:
        return jsonify({
            'success': True,
            'message': '修改成功。'
        })
    return jsonify({
        'success': False,
        'message': '数据格式错误！'
    })


@adminInner_bp.route('/modifySeasonDish', methods=['POST'])
def modifySeasonDish():
    if session.get('usrId') != DEFAULT_ADMIN_NAME:
        return jsonify({
            'success': False,
            'message': '401 Forbidden'
        })

    chosenSeason = request.form.get('dishSeason')
    dishNumber = request.form.get('seasonDishNum')
    zero = '0'

    query1 = """
        UPDATE Dish 
        SET DishStock = ? 
        WHERE SeasonalAttribute = ?
        """
    if not execute_non_query(query1, (dishNumber, chosenSeason)):
        return jsonify({
            'success': False,
            'message': 'Failed to update selected season dishes'
        })

    # 构建并执行第二个SQL语句：更新其他季节的菜品库存
    other_seasons = [s for s in ('spring', 'summer', 'autumn', 'winter') if s != chosenSeason]
    if other_seasons:
        placeholders = ', '.join(['?'] * len(other_seasons))
        query2 = f"""
            UPDATE Dish 
            SET DishStock = ? 
            WHERE SeasonalAttribute IN ({placeholders})
            """
        params = [zero] + other_seasons
        if not execute_non_query(query2, params):
            return jsonify({
                'success': False,
                'message': 'Failed to update other season dishes'
            })

    return jsonify({
        'success': True,
        'message': 'ok'
    })


@adminInner_bp.route('/getSupplierDetails', methods=['POST'])
def getSupplierDetails():
    if session.get('usrId') != DEFAULT_ADMIN_NAME:
        return jsonify({
            'success': False,
            'message': '401 Forbidden'
        })
    query = "SELECT SupplierID, SupplierName, Address, ContactNumber FROM Supplier"

    result = execute_query(query)

    if result is None:
        # 查询失败，返回错误响应
        return jsonify({
            'success': False,
            "data": '数据库查询失败'
        })

    # 转换数据格式
    formatted_data = [
        {'id': item['SupplierID'], 'name': item['SupplierName'], 'address': item['Address'],
         'phone': item['ContactNumber']}
        for item in result]

    # 返回 JSON 响应
    return jsonify({
        'success': True,
        "data": formatted_data
    })


@adminInner_bp.route('/addIngredient', methods=['POST'])
def addIngredient():
    if session.get('usrId') != DEFAULT_ADMIN_NAME:
        return jsonify({
            'success': False,
            'message': '401 Forbidden'
        })

    ingredientID = request.form.get('ingredientID')
    ingredientName = request.form.get('ingredientName')
    ingredientUnit = request.form.get('ingredientUnit')
    ingredientStock = request.form.get('ingredientStock')
    ingredientThreshold = request.form.get('ingredientThreshold')
    ingredientSupplierId = request.form.get('ingredientSupplierId')

    if not ingredientSupplierId or not check_value_exists('Supplier', 'SupplierID', ingredientSupplierId):
        return jsonify({
            'success': False,
            'message': '请选择正确的供应商信息'
        })

    if check_value_exists('Ingredient', 'IngredientID', ingredientID):
        return jsonify({
            'success': False,
            'message': '该菜品ID已存在'
        })

    query = """
        INSERT INTO Ingredient (IngredientID, IngredientName, Unit, Stock, Threshold, SupplierID) 
        VALUES (?, ?, ?, ?, ?, ?);
        """

    success = execute_non_query(query, (
        ingredientID, ingredientName, ingredientUnit, ingredientStock, ingredientThreshold, ingredientSupplierId))

    if success:
        return jsonify({
            'success': True,
            'message': "新建食材成功！"
        })
    return jsonify({
        'success': False,
        'message': "数据库插入操作错误"
    })


@adminInner_bp.route('/modifyIngredient', methods=['POST'])
def modifyIngredient():
    if session.get('usrId') != DEFAULT_ADMIN_NAME:
        return jsonify({
            'success': False,
            'message': "401 Forbidden"
        })

    ingreID = request.form.get('ingreID')
    newIngreThreshold = request.form.get('newIngreThreshold')
    newIngreStock = request.form.get('newIngreStock')
    ingredientSupplierId = request.form.get('ingredientSupplierId')

    set_clauses = []
    params = []

    if newIngreThreshold is not None:
        set_clauses.append("Threshold = ?")
        params.append(newIngreThreshold)

    if newIngreStock is not None:
        set_clauses.append("Stock = ?")
        params.append(newIngreStock)

    if ingredientSupplierId is not None:
        set_clauses.append("SupplierID = ?")
        params.append(ingredientSupplierId)

    # 添加主键条件
    params.append(ingreID)

    # 构建完整SQL
    query = f"UPDATE Ingredient SET {', '.join(set_clauses)} WHERE IngredientID = ?"

    # 执行数据库更新
    success = execute_non_query(query, params)
    if success:
        return jsonify({
            'success': True,
            'message': '修改成功。'
        })
    return jsonify({
        'success': False,
        'message': '数据格式错误！'
    })


@adminInner_bp.route('/getWindowData', methods=['POST'])
def getWindowData():
    if session.get('usrId') != DEFAULT_ADMIN_NAME:
        return jsonify({
            'success': False,
            'data': "401 Forbidden"
        })

    query = "SELECT WindowID, WindowName, Manager FROM Window"

    result = execute_query(query)

    if result is None:
        # 查询失败，返回错误响应
        return jsonify({
            'success': False,
            "data": "数据库查询失败"
        })

    # 转换数据格式
    formatted_data = [{'id': item['WindowID'], 'name': item['WindowName'], 'manager': item['Manager']} for item in result]

    # 返回 JSON 响应
    return jsonify({
        'success': True,
        "data": formatted_data
    })


@adminInner_bp.route('/modifyWindow', methods=['POST'])
def modifyWindow():
    if session.get('usrId') != DEFAULT_ADMIN_NAME:
        return jsonify({
            'success': False,
            'message': "401 Forbidden"
        })

    windowID = request.form.get('windowID')
    newWindowName = request.form.get('newWindowName')
    newWindowManager = request.form.get('newWindowManager')

    set_clauses = []
    params = []

    if newWindowName is not None:
        set_clauses.append("WindowName = ?")
        params.append(newWindowName)

    if newWindowManager is not None:
        set_clauses.append("Manager = ?")
        params.append(newWindowManager)

    # 添加主键条件
    params.append(windowID)

    # 构建完整SQL
    query = f"UPDATE Window SET {', '.join(set_clauses)} WHERE WindowID = ?"

    # 执行数据库更新
    success = execute_non_query(query, params)
    if success:
        return jsonify({
            'success': True,
            'message': '修改成功。'
        })
    return jsonify({
        'success': False,
        'message': '数据格式错误！'
    })


@adminInner_bp.route('/getIngredientsDataBelowThreshold', methods=['POST'])
def getIngredientsDataBelowThreshold():
    if session.get('usrId') != DEFAULT_ADMIN_NAME:
        return jsonify({
            'success': False,
            'data': "401 Forbidden"
        })

    query = "SELECT IngredientID, IngredientName, Stock, Threshold FROM Ingredient WHERE Stock < Threshold"

    result = execute_query(query)

    if result is None:
        # 查询失败，返回错误响应
        return jsonify({
            'success': False,
            "data": "数据库查询失败"
        })

    # 转换数据格式
    formatted_data = [
        {'id': item['IngredientID'], 'name': item['IngredientName'], 'stock': item['Stock'],
         'threshold': item['Threshold']} for item in result]

    # 返回 JSON 响应
    return jsonify({
        'success': True,
        "data": formatted_data
    })


@adminInner_bp.route('/buyIngredientsBelowThresholdToIt', methods=['POST'])
def buyIngredientsBelowThresholdToIt():
    if session.get('usrId') != DEFAULT_ADMIN_NAME:
        return jsonify({
            'success': False,
            'data': "401 Forbidden"
        })

    update_query = """
        UPDATE Ingredient
        SET Stock = Threshold
        WHERE Stock < Threshold;
        """

    # 执行更新操作
    success = execute_non_query(update_query)

    if success:
        return jsonify({
            'success': True,
            'data': "采购成功！"
        })
    else:
        return jsonify({
            'success': False,
            'data': "采购失败，数据库更改存在问题。"
        })


@adminInner_bp.route('/addWindow', methods=['POST'])
def addWindow():
    if session.get('usrId') != DEFAULT_ADMIN_NAME:
        return jsonify({
            'success': False,
            'message': "401 Forbidden"
        })

    windowID = request.form.get('windowID')

    if check_value_exists('Window', 'WindowID', windowID):
        return jsonify({
            'success': False,
            'message': '窗口ID已存在'
        })

    windowName = request.form.get('windowName')
    windowManager = request.form.get('windowManager')

    insert_query = """
        INSERT INTO Window (WindowID, WindowName, Manager)
        VALUES (?, ?, ?);
        """

    success = execute_non_query(insert_query, (windowID, windowName, windowManager))

    if success:
        return jsonify({
            'success': True,
            'message': '新建窗口成功'
        })
    else:
        return jsonify({
            'success': False,
            'message': '数据库错误！'
        })


@adminInner_bp.route('/addSupplier', methods=['POST'])
def addSupplier():
    if session.get('usrId') != DEFAULT_ADMIN_NAME:
        return jsonify({
            'success': False,
            'message': "401 Forbidden"
        })

    supplierID = request.form.get('supplierID')

    if check_value_exists('Supplier', 'SupplierID', supplierID):
        return jsonify({
            'success': False,
            'message': '供应商ID已存在'
        })

    supplierName = request.form.get('supplierName')
    supplierAddress = request.form.get('supplierAddress')
    supplierContactNumber = request.form.get('supplierContactNumber')

    insert_query = """
        INSERT INTO Supplier (SupplierID, SupplierName, Address, ContactNumber)
        VALUES (?, ?, ?, ?);
        """

    success = execute_non_query(insert_query, (supplierID, supplierName, supplierAddress, supplierContactNumber))

    if success:
        return jsonify({
            'success': True,
            'message': '新建供应商成功'
        })
    else:
        return jsonify({
            'success': False,
            'message': '数据库错误！'
        })


@adminInner_bp.route('/addStudentCard', methods=['POST'])
def addStudentCard():
    if session.get('usrId') != DEFAULT_ADMIN_NAME:
        return jsonify({
            'success': False,
            'message': "401 Forbidden"
        })

    studentCardID = request.form.get('studentCardID')

    if check_value_exists('StudentCard', 'CardID', studentCardID):
        return jsonify({
            'success': False,
            'message': '学生卡ID已存在'
        })

    studentCardBalance = request.form.get('studentCardBalance')

    insert_query = """
        INSERT INTO StudentCard (CardID, Balance)
        VALUES (?, ?);
        """

    success = execute_non_query(insert_query, (studentCardID, studentCardBalance))

    if success:
        return jsonify({
            'success': True,
            'message': '新建学生卡成功'
        })
    else:
        return jsonify({
            'success': False,
            'message': '数据库错误！'
        })


# 传入WindowsId, 获得所有的出售的菜品的DishId
@adminInner_bp.route('/getSalesData', methods=['POST'])
def getSalesData():
    if session.get('usrId') != DEFAULT_ADMIN_NAME:
        return jsonify({
            'success': False,
            'data': "401 Forbidden"
        })

    windowId = request.data.decode('utf-8')

    query = "SELECT DishID FROM Sale WHERE WindowID = ?"

    result = execute_query(query, (windowId,))

    if result is None:
        # 查询失败，返回错误响应
        return jsonify({
            'success': False,
            "data": "数据库查询失败"
        })

    # 转换数据格式
    formatted_data = [{'dishId': item['DishID']} for item in result]

    # 返回 JSON 响应
    return jsonify({
        'success': True,
        "data": formatted_data
    })


@adminInner_bp.route('/modifyDishToWindow', methods=['POST'])
def modifyDishToWindow():
    # const data = {
    #             dishId: dishId,
    #             windowId: windowId,
    #             handle: handle
    #         };

    if session.get('usrId') != DEFAULT_ADMIN_NAME:
        return jsonify({
            'success': False,
            'message': "401 Forbidden"
        })

    data = request.json

    if not data:
        return jsonify({
            'success': False,
            'message': "调用接口时传参错误"
        })

    dishId = data.get('dishId')
    windowId = data.get('windowId')
    handle = data.get('handle')

    if handle == 'drop':
        query = "DELETE FROM Sale WHERE WindowID = ? AND DishID = ?"
        params = (windowId, dishId)
        success = execute_non_query(query, params)
    elif handle == 'add':
        query = "INSERT INTO Sale (WindowID, DishID) VALUES (?, ?)"
        params = (windowId, dishId)
        success = execute_non_query(query, params)
    else:
        return jsonify({
            'success': False,
            'message': "handle参数值错误"
        })

    if success:
        return jsonify({
            'success': True,
            'message': "操作成功"
        })
    else:
        return jsonify({
            'success': False,
            'message': "数据库操作失败"
        })


@adminInner_bp.route('/delSupplier', methods=['POST'])
def delSupplier():
    if session.get('usrId') != DEFAULT_ADMIN_NAME:
        return jsonify({
            'success': False,
            'message': "401 Forbidden"
        })
    supplierId = request.form.get('supplierId')
    if check_value_exists('Ingredient', 'SupplierID', supplierId):
        return jsonify({
            'success': False,
            'message': "该供应商与食材还存在供货的关系！请解绑关系后重试。"
        })

    query = "DELETE FROM Supplier WHERE SupplierID = ?"
    params = (supplierId,)
    success = execute_non_query(query, params)

    if success:
        return jsonify({
            'success': True,
            'message': "删除供应商成功！"
        })
    else:
        return jsonify({
            'success': False,
            'message': "数据库操作失败"
        })


@adminInner_bp.route('/getStudentCardData', methods=['POST'])
def getStudentCardData():
    if session.get('usrId') != DEFAULT_ADMIN_NAME:
        return jsonify({
            'success': False,
            'data': "401 Forbidden"
        })

    query = """
        SELECT 
            sc.CardID AS CardNumber,
            sc.Balance AS CardBalance,
            s.StudentID AS StudentNumber,
            s.Name AS StudentName
        FROM StudentCard sc
        LEFT JOIN Student s 
            ON sc.CardID = s.CardID
        ORDER BY 
            CASE 
                WHEN s.StudentID IS NULL OR s.Name IS NULL THEN 0
                ELSE 1
            END ASC,
            sc.CardID ASC;
    """

    result = execute_query(query)

    if result is None:
        # 查询失败，返回错误响应
        return jsonify({
            'success': False,
            'data': "数据库查询失败"
        })

    # 转换数据格式
    formatted_data = [
        {'a_cardId': item['CardNumber'], 'balance': item['CardBalance'], 'studentId': item['StudentNumber'],
         'studentName': item['StudentName']} for item in result]

    # 返回 JSON 响应
    return jsonify({
        'success': True,
        'data': formatted_data
    })


# 热门菜品查询
@adminInner_bp.route('/getHot10Dish', methods=['POST'])
def getHot10Dish():
    if session.get('usrId') != DEFAULT_ADMIN_NAME:
        return jsonify({
            'success': False,
            'data': "401 Forbidden"
        })

    query = """
        SELECT TOP 10
            d.DishName AS DishNAME,
            SUM(oi.QuantityOfDish) AS SalesCount
        FROM OrderItem oi
        JOIN Dish d ON oi.DishID = d.DishID
        GROUP BY d.DishName, d.DishID
        ORDER BY SalesCount DESC, d.DishID ASC;
    """

    result = execute_query(query)

    if result is None:
        # 查询失败，返回错误响应
        return jsonify({
            'success': False,
            "data": "数据库查询失败"
        })

    # 转换数据格式
    formatted_data = [{'a_idx': idx, 'dishName': item['DishNAME'], 'sales': item['SalesCount']} for
                      idx, item in enumerate(result, start=1)]

    # 返回 JSON 响应
    return jsonify({
        'success': True,
        "data": formatted_data
    })


# 窗口绩效查询
@adminInner_bp.route('/getWindowSales', methods=['POST'])
def getWindowSales():
    if session.get('usrId') != DEFAULT_ADMIN_NAME:
        return jsonify({
            'success': False,
            'data': "401 Forbidden"
        })

    # 不显示无绩效的窗口的query语句
    # query = """
    #     SELECT
    #         w.WindowName AS WindowName,
    #         w.Manager AS Manager,
    #         SUM(od.TotalAmount) AS TotalSales
    #     FROM OrderDetail od
    #     JOIN Window w ON od.WindowID = w.WindowID
    #     GROUP BY w.WindowName, w.Manager, w.WindowID
    #     ORDER BY TotalSales DESC, w.WindowID ASC;
    # """

    query = """
        SELECT 
            w.WindowName AS WindowName,
            w.Manager AS Manager,
            COALESCE(SUM(od.TotalAmount), 0) AS TotalSales
        FROM 
            Window w
        LEFT JOIN 
            OrderDetail od ON w.WindowID = od.WindowID
        GROUP BY 
            w.WindowID, w.WindowName, w.Manager
        ORDER BY 
            TotalSales DESC, w.WindowID ASC;
    """

    result = execute_query(query)

    if result is None:
        # 查询失败，返回错误响应
        return jsonify({
            'success': False,
            "data": "数据库查询失败"
        })

    # 转换数据格式
    formatted_data = [
        {'b_idx': idx, 'c_windowName': item['WindowName'], 'd_manager': item['Manager'], 'e_money': item['TotalSales']}
        for idx, item in enumerate(result, start=1)]

    # 返回 JSON 响应
    return jsonify({
        'success': True,
        "data": formatted_data
    })


@adminInner_bp.route('/getOrdersBetweenDates', methods=['POST'])
def getOrdersBetweenDates():
    if session.get('usrId') != DEFAULT_ADMIN_NAME:
        return jsonify({
            'success': False,
            'message': "401 Forbidden",
            'data': "none"
        })

    start_date = request.form.get('startDate')
    end_date = request.form.get('endDate')

    if start_date is None or end_date is None or start_date == '' or end_date == '':
        return jsonify({
            'success': False,
            'message': "请选择起始日期与结束日期！",
            'data': "none"
        })

    def compare_dates(startDate: str, endDate: str) -> bool:
        """
        判断 startDate 是否在 endDate 之前（不包括相等）
        """
        start_date_ = datetime.strptime(startDate, '%Y-%m-%d').date()
        end_date_ = datetime.strptime(endDate, '%Y-%m-%d').date()

        return start_date_ <= end_date_

    if not compare_dates(start_date, end_date):
        return jsonify({
            'success': False,
            'message': "结束日期不能在起始日期之前！",
            'data': 'none'
        })

    query = """
            SELECT 
                FORMAT(od.OrderTime, 'yyyy-MM-dd HH:mm:ss') AS OrderTime,
                od.TotalAmount AS TotalAmount,
                w.WindowName AS WindowName
            FROM OrderDetail od
            JOIN Window w ON od.WindowID = w.WindowID
            WHERE 
                od.OrderTime >= ? 
                AND od.OrderTime < DATEADD(DAY, 1, ?)
            ORDER BY od.OrderTime ASC;
        """

    params = (start_date, end_date)

    result = execute_query(query, params)

    if result is None:
        return jsonify({
            'success': False,
            'message': "数据库查询失败",
            'data': 'none'
        })

    # 转换数据格式
    formatted_data = [
        {'a_windowName': item['WindowName'], 'b_orderTime': item['OrderTime'], 'c_totalAmount': item['TotalAmount']}
        for item in result]

    # 返回 JSON 响应
    return jsonify({
        'success': True,
        'message': 'ok',
        "data": formatted_data
    })
