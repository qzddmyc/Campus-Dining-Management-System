import bcrypt
import pyodbc
from config import DB_CONFIG

# 这是定义数据库基本接口的文件。所有与数据库连接、执行语句的接口均在此。


def get_db_connection():
    """获取SQL Server数据库连接"""
    try:
        connection = pyodbc.connect(
            f"DRIVER={DB_CONFIG['driver']};"
            f"SERVER={DB_CONFIG['server']};"
            f"DATABASE={DB_CONFIG['database']};"
            f"Trusted_Connection={DB_CONFIG['trusted_connection']}"
        )
        return connection
    except Exception as e:
        print(f"数据库连接错误: {e}")
        return None


def execute_query(query, params=None):
    """执行SQL查询并返回结果"""
    conn = get_db_connection()
    if not conn:
        print("无法建立数据库连接")
        return None

    try:
        with conn.cursor() as cursor:
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)

            # 处理查询结果
            if cursor.description:  # 检查是否有结果集
                columns = [column[0] for column in cursor.description]
                rows = cursor.fetchall()
                return [dict(zip(columns, row)) for row in rows]
            else:
                return []  # 无结果集
    except Exception as e:
        print(f"查询执行错误: {e}")
        return None
    finally:
        conn.close()


def execute_non_query(query, params=None):
    """执行非查询操作(INSERT, UPDATE, DELETE)"""
    conn = get_db_connection()
    if not conn:
        return False

    try:
        cursor = conn.cursor()
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)

        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"非查询操作错误: {e}")
        conn.rollback()
        conn.close()
        return False


def check_value_exists(table_name: str, column_name: str, value: str) -> bool:
    """
    检查 SQL Server 数据库中指定表的列是否存在特定值
    :param table_name: 表名
    :param column_name: 列名
    :param value: 需要检查的值
    :return: 存在返回 True，否则 False
    """
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # 防止 SQL 注入，对表名和列名进行简单验证
            if not (table_name.isidentifier() and column_name.isidentifier()):
                raise ValueError("非法的表名或列名")

            query = f"SELECT COUNT(1) FROM {table_name} WHERE {column_name} = ?"
            cursor.execute(query, value)
            return cursor.fetchone()[0] > 0
    finally:
        conn.close()


def save_password(stuId: str, pwd: str) -> bool:
    # 给定学生id与用户自定义密码，将其保存至数据库，并返回正确状态

    if check_value_exists('Password', 'StudentID', stuId):
        return False

    def hash_password(password: str) -> bytes:
        """将明文密码转换为哈希值"""
        # 生成盐值并哈希密码
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed

    hashed_pwd = hash_password(pwd)

    query = 'INSERT INTO Password (StudentID, AccountPassword) VALUES (?, ?)'
    values = (stuId, hashed_pwd)

    success = execute_non_query(query, values)
    if not success:
        print('向数据库添加密码信息错误！')
    return success


def verify_stuAccount_password(stuId: str, password: str) -> bool:
    """给定用户的id，与输入的密码，判断密码与数据库中的密码是否一致"""

    if not check_value_exists('Password', 'StudentID', stuId):
        return False

    def get_student_password(stu_id):
        """查询指定学生的账户密码"""
        query = "SELECT AccountPassword FROM Password WHERE StudentID = ?"
        params = (stu_id,)
        result = execute_query(query, params)

        if result:
            return result[0]["AccountPassword"]
        else:
            return None

    def verify_password(pwd: str, hashed_password: bytes) -> bool:
        """验证密码是否匹配哈希值"""
        return bcrypt.checkpw(pwd.encode('utf-8'), hashed_password)

    password_in_database = get_student_password(stuId)

    if not password_in_database:
        return False

    return verify_password(password, password_in_database)


def update_stuAccount_password(stuId: str, new_password: str) -> bool:
    """给定学生ID与新密码，将数据库中对应的密码更新为新密码的哈希值"""

    if not check_value_exists('Password', 'StudentID', stuId):
        return False

    def hash_new_password(password: str) -> bytes:
        """对新密码进行哈希处理"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt)

    def update_password_in_db(stu_id: str, hashed_password: bytes) -> bool:
        """更新数据库中的密码"""
        query = "UPDATE Password SET AccountPassword = ? WHERE StudentID = ?"
        params = (hashed_password, stu_id)
        return execute_non_query(query, params)

    hashed_new_password = hash_new_password(new_password)
    return update_password_in_db(stuId, hashed_new_password)
