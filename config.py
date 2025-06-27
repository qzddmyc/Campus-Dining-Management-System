DB_NAME = "DiningManagementSystem"

ADMIN_ID = "root"
ADMIN_PASSWORD = "admin"

DB_CONFIG = {
    'driver': '{ODBC Driver 17 for SQL Server}',
    'server': 'localhost',
    'database': f'{DB_NAME}',
    'trusted_connection': 'yes'
}

# 允许的延迟秒数
ALLOWED_DELAY = 2

# 默认的管理员账号名称
DEFAULT_ADMIN_NAME = ADMIN_ID
