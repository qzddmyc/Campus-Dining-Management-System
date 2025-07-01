import os
from database import execute_query, get_db_connection, save_password
from config import DB_NAME


def check_database_exists():
    """检查数据库是否存在"""
    query = f"SELECT COUNT(*) FROM sys.databases WHERE name = '{DB_NAME}'"
    result = execute_query(query)
    return result[0][''] if result else False


def execute_sql_file(file_path):
    """执行SQL脚本文件"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            sql_script = file.read()

        # 移除所有GO语句
        sql_script = sql_script.replace('GO', ' ')

        # 使用指定数据库创建连接
        conn = get_db_connection()
        if not conn:
            raise Exception("无法建立数据库连接")

        with conn.cursor() as cursor:
            # 直接执行完整脚本
            cursor.execute(sql_script)
            conn.commit()

        print(f"成功执行: {file_path}")
        return True
    except Exception as e:
        print(f"执行SQL文件失败 ({file_path}): {e}")
        return False


def main():
    """主函数：初始化数据库"""
    print("开始初始化数据库...")

    # 检查数据库是否存在
    db_exists = check_database_exists()

    if not db_exists:
        print(f"错误：数据库 '{DB_NAME}' 不存在，无法继续初始化")
        return

    # 项目根目录
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    # 执行初始化脚本
    init_sql_path = os.path.join(project_root, 'database', 'init.sql')
    if os.path.exists(init_sql_path):
        if not execute_sql_file(init_sql_path):
            print("执行初始化脚本失败，初始化终止")
            return
    else:
        print(f"未找到初始化脚本: {init_sql_path}")
        return

    # 需要手动执行
    # check_reference_path = os.path.join(project_root, 'database', 'checkreference.sql')
    # if os.path.exists(check_reference_path):
    #     if not execute_sql_file(check_reference_path):
    #         print("执行数据库约束脚本失败，初始化终止")
    #         return
    # else:
    #     print(f"未找到数据库约束脚本: {check_reference_path}")
    #     return

    # 执行数据脚本
    data_sql_path = os.path.join(project_root, 'database', 'data.sql')
    if os.path.exists(data_sql_path):
        if not execute_sql_file(data_sql_path):
            print("执行数据脚本失败")
            return
    else:
        print(f"未找到数据脚本: {data_sql_path}")
        return

    print("正在初始化学生账号密码信息...")

    stu_pwd_data = [('STU001', 'PWD001'),
                    ('STU002', 'PWD002'),
                    ('STU003', 'PWD003'),
                    ('STU004', 'PWD004'),
                    ('STU005', 'PWD005'),
                    ('STU006', 'PWD006'),
                    ('STU007', 'PWD007'),
                    ('STU008', 'PWD008'),
                    ('STU009', 'PWD009'),
                    ('STU010', 'PWD010'),
                    ('STU011', 'PWD011'),
                    ('STU012', 'PWD012'),
                    ('STU013', 'PWD013'),
                    ('STU014', 'PWD014'),
                    ('STU015', 'PWD015'),
                    ('STU016', 'PWD016'),
                    ('STU017', 'PWD017'),
                    ('STU018', 'PWD018'),
                    ('STU019', 'PWD019'),
                    ('STU020', 'PWD020')]

    for stu, pwd in stu_pwd_data:
        success = save_password(stu, pwd)
        if not success:
            print(f'学生密码信息({stu}-{pwd})新建失败！')
            return

    print("数据库初始化完成!")


if __name__ == "__main__":
    # 开启数据库服务: sudo sc start MSSQLSERVER

    check = input(f'确定初始化你的{DB_NAME}数据库吗？你需要保证该数据库已存在。(y/n) :')
    if check == 'y' or check == 'Y':
        main()
    else:
        print('初始化操作取消')
