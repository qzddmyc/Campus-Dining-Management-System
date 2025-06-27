from flask import Blueprint, render_template

errors_bp = Blueprint('errors', __name__, url_prefix='/api/errors')


@errors_bp.route('/404')
def error_404_handler():
    return render_template('error/404.html')

@errors_bp.route('/403')
def error_403_handler():
    return render_template('error/403.html')
